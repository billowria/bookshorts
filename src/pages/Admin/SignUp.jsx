import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Text,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
  FormHelperText,
  VStack,
  useToast
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '../../services/supabase';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'admin'
          }
        }
      });

      if (signUpError) throw signUpError;

      // If signup successful, create a profile in the profiles table
      if (signUpData.user) {
        // Use upsert instead of insert to handle potential conflicts
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: signUpData.user.id,
              full_name: formData.fullName,
              email: formData.email,
              role: 'admin',
              updated_at: new Date().toISOString()
            }
          ], {
            onConflict: 'id',
            ignoreDuplicates: false
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create profile. Please contact support.');
        }
      }

      // Show success message
      toast({
        title: 'Account created successfully!',
        description: 'Please check your email for verification.',
        status: 'success',
        duration: 5000,
        isClosable: true
      });

      // Redirect to login page after successful signup
      navigate('/admin/login');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
      <Box
        as="form"
        onSubmit={handleSubmit}
        w="full"
        maxW="md"
        p={8}
        borderRadius="lg"
        boxShadow="xl"
        bg={cardBg}
      >
        <VStack spacing={6}>
          <Heading as="h1" size="xl" textAlign="center">
            Admin Sign Up
          </Heading>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
              <InputRightElement>
                <IconButton
                  icon={showPassword ? <FiEyeOff /> : <FiEye />}
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                />
              </InputRightElement>
            </InputGroup>
            <FormHelperText>Password must be at least 6 characters long</FormHelperText>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
              <Input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
              />
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
            colorScheme="blue"
            size="lg"
            width="full"
            isLoading={loading}
            loadingText="Signing up..."
          >
            Sign Up
          </Button>

          <Text textAlign="center">
            Already have an account?{' '}
            <Button
              as={RouterLink}
              to="/admin/login"
              variant="link"
              colorScheme="blue"
            >
              Sign In
            </Button>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default SignUp; 