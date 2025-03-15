import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Heading,
  Divider,
  HStack,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  InputLeftElement,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { supabase } from '../services/supabase';

const Auth = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        if (error) throw error;
        
        // Create a profile for the new user
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                role: 'user'
              }
            ]);

          if (profileError) throw profileError;
        }
        
        toast({
          title: 'Sign up successful!',
          description: 'Please check your email for verification.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        console.log('Login successful:', data);
        
        toast({
          title: 'Login successful!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        if (onAuthSuccess) {
          onAuthSuccess(data);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      p={8}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="xl"
      maxW="400px"
      w="100%"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Heading>
        
        <Text color="gray.500" textAlign="center">
          {isSignUp 
            ? 'Sign up to access all features'
            : 'Sign in to access your account'
          }
        </Text>

        <form onSubmit={handleAuth}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <InputGroup>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
                <InputLeftElement>
                  <Box pl={3}><FiMail /></Box>
                </InputLeftElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <InputLeftElement>
                  <Box pl={3}><FiLock /></Box>
                </InputLeftElement>
                <InputRightElement>
                  <IconButton
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="brand"
              size="lg"
              width="full"
              isLoading={loading}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </VStack>
        </form>

        <Divider />

        <HStack justify="center" spacing={1}>
          <Text>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <Button
            variant="link"
            color="brand.500"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Auth; 