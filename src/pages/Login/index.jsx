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
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const inputFocusBg = useColorModeValue('gray.100', 'gray.600');

  // Toast configurations
  const adminToastConfig = {
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
  };

  const userToastConfig = {
    status: 'success',
    duration: 3000,
    isClosable: true,
    position: 'top-right'
  };

  const errorToastConfig = {
    status: 'error',
    duration: 3000,
    isClosable: true,
    position: 'top-right'
  };

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
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
            },
          }
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              full_name: name,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            });

          if (profileError) throw profileError;
        }

        // Show account creation success message
        toast({
          ...userToastConfig,
          title: 'Account created!',
          description: 'Please check your email to confirm your account.',
          duration: 5000
        });

        // Sign in after successful signup
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signInData.user.id)
          .single();

        if (profileError) throw profileError;

        // Navigate based on role
        if (profileData?.role === 'admin') {
          navigate('/admin');
          // Show admin welcome message
          toast({
            ...adminToastConfig,
            title: 'Welcome to Admin Dashboard'
          });
        } else {
          navigate(location.state?.from || '/');
          // Show regular user welcome message
          toast({
            ...userToastConfig,
            title: `Welcome ${name}!`
          });
        }
      } else {
        // Regular sign in
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

        // Navigate and show welcome message based on role
        if (profileData?.role === 'admin') {
          navigate('/admin');
          toast({
            ...adminToastConfig,
            title: 'Welcome to Admin Dashboard'
          });
        } else {
          navigate(location.state?.from || '/');
          toast({
            ...userToastConfig,
            title: `Welcome back, ${data.user.user_metadata?.full_name?.split(' ')[0] || 'User'}!`
          });
        }
      }
    } catch (error) {
      console.error(`Error ${isSignUp ? 'signing up' : 'signing in'}:`, error);
      setError(error.message);
      // Show error message
      toast({
        ...errorToastConfig,
        title: 'Error',
        description: error.message
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
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container
        as={SimpleGrid}
        maxW="7xl"
        columns={{ base: 1, md: 2 }}
        spacing={{ base: 10, lg: 32 }}
        py={{ base: 10, sm: 20 }}
      >
        {/* Left Side - Welcome Content */}
        <Stack spacing={{ base: 10, md: 20 }}>
          <MotionBox
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <Heading
              lineHeight={1.1}
              fontSize={{ base: '3xl', sm: '4xl', md: '5xl', lg: '6xl' }}
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              Welcome to{' '}
              <Text
                as={'span'}
                bgGradient="linear(to-r, purple.500, pink.400)"
                bgClip="text"
              >
                BookShorts
              </Text>
            </Heading>
            <Text
              fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
              color={mutedColor}
              mt={5}
            >
              Join our community of book lovers and discover insights from the world's best books.
              Get access to expert summaries and engage with fellow readers.
            </Text>
          </MotionBox>

          <MotionBox
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <Stack direction={'row'} spacing={4} align={'center'}>
              <AvatarGroup>
                {avatars.map((avatar) => (
                  <Avatar
                    key={avatar.name}
                    name={avatar.name}
                    src={avatar.url}
                    size={useBreakpointValue({ base: 'md', md: 'lg' })}
                    position={'relative'}
                    zIndex={2}
                    _before={{
                      content: '""',
                      width: 'full',
                      height: 'full',
                      rounded: 'full',
                      transform: 'scale(1.125)',
                      bgGradient: 'linear(to-bl, purple.400,pink.400)',
                      position: 'absolute',
                      zIndex: -1,
                      top: 0,
                      left: 0,
                    }}
                  />
                ))}
              </AvatarGroup>
              <Text fontSize={{ base: 'md', md: 'lg' }} color={mutedColor}>
                +2.5k readers joined this month
              </Text>
            </Stack>
          </MotionBox>
        </Stack>

        {/* Right Side - Login/Signup Form */}
        <MotionFlex
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          direction="column"
          bg={bgColor}
          rounded="xl"
          p={{ base: 8, sm: 10 }}
          spacing={8}
          boxShadow="xl"
          borderWidth="1px"
          borderColor={borderColor}
          sx={{
            '&:hover': { boxShadow: '2xl' },
            transition: 'all 0.3s ease'
          }}
        >
          <Stack spacing={6}>
            <Heading
              color={textColor}
              lineHeight={1.1}
              fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
            >
              {isSignUp ? 'Create Account' : 'Sign in to your account'}
              <Text
                as={'span'}
                bgGradient="linear(to-r, purple.400,pink.400)"
                bgClip="text"
                fontSize="xl"
                display="block"
                mt={2}
              >
                {isSignUp ? 'Join our community today' : 'Enjoy unlimited access to book summaries'}
              </Text>
            </Heading>
          </Stack>

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