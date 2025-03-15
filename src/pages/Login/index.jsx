import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  FormErrorMessage,
  useColorModeValue,
  HStack,
  Link as ChakraLink,
  InputGroup,
  InputLeftElement,
  Divider,
  Icon
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('brand.500', 'brand.300');

  // If user is already logged in, redirect to the return URL or profile
  useEffect(() => {
    if (user) {
      const returnPath = location.state?.from || '/profile';
      navigate(returnPath, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (isSignUp) {
        // Handle signup
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          }
        });

        if (signUpError) throw signUpError;

        toast({
          title: 'Account created!',
          description: 'Please check your email to confirm your account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });

        // Create a profile entry
        if (data?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: name,
              role: 'user',
              created_at: new Date(),
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }

        // Reset form and switch to login
        setIsSignUp(false);
      } else {
        // Handle login
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Check user role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        const isAdmin = profileData?.role === 'admin';

   

        // Redirect based on role
        if (isAdmin) {
          navigate('/admin');
          toast({
            title: `Welcome  ${data.user.user_metadata?.full_name?.split(' ')[0] || 'User'}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top',
            colorScheme: 'red',
            containerStyle: {
              fontSize: 'xl',
              textAlign: 'center',
              width: '100%'
            }
          });
        } else {
          navigate(location.state?.from || '/');
          toast({
            title: `Welcome back, ${data.user.user_metadata?.full_name?.split(' ')[0] || 'User'}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top-right'
          });
        }
      }
    } catch (error) {
      console.error(`Error ${isSignUp ? 'signing up' : 'signing in'}:`, error);
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <Container maxW="container.sm" py={8}>
      <Box
        bg={bgColor}
        p={8}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        shadow="lg"
      >
        <VStack spacing={6}>
          <Heading size="xl">{isSignUp ? 'Create Account' : 'Welcome Back'}</Heading>
          <Text color="gray.500">
            {isSignUp ? 'Sign up to get started' : 'Sign in to access your account'}
          </Text>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4} align="stretch">
              {isSignUp && (
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiUser color="gray.300" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                      placeholder="Your full name"
                    />
                  </InputGroup>
                </FormControl>
              )}

              <FormControl isInvalid={!!error}>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiMail} color="gray.300" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Your email address"
                  />
                </InputGroup>
              </FormControl>

              <FormControl isInvalid={!!error}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiLock} color="gray.300" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  />
                </InputGroup>
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                width="100%"
                isLoading={loading}
                mt={2}
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </VStack>
          </form>

          <Divider />
          
          <HStack justify="center" width="100%">
            <Text>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <ChakraLink
              as={RouterLink}
              to={isSignUp ? '/login' : '/signup'}
              color={accentColor}
              onClick={toggleMode}
              fontWeight="medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </ChakraLink>
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
};

export default Login; 