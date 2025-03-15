// src/pages/Admin/Login.jsx
import React, { useState, useEffect } from 'react';
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
  VStack,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        // Check if user is admin
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data?.role === 'admin') {
          navigate('/admin');
        } else {
          // If not admin, redirect to user login
          navigate('/login');
        }
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if user is admin after successful login
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // If we get here, user is an admin
      navigate('/admin');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Don't render anything while checking admin status
  if (user) {
    return null;
  }

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
            Admin Login
          </Heading>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoFocus
            />
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
            loadingText="Signing in..."
          >
            Sign In
          </Button>

          <Text textAlign="center">
            Don't have an account?{' '}
            <Button
              as={RouterLink}
              to="/admin/signup"
              variant="link"
              colorScheme="blue"
            >
              Sign Up
            </Button>
          </Text>

          <Button
            as={RouterLink}
            to="/admin/forgot-password"
            variant="link"
            colorScheme="blue"
            size="sm"
          >
            Forgot Password?
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default AdminLogin;