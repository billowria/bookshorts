// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Spinner, VStack, Text, Container, Alert, AlertIcon } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, error, isAdmin } = useAuth();
  const location = useLocation();

  // If there's an error, show it
  if (error) {
    console.error('Authentication error:', error);
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Authentication error: {error}
        </Alert>
      </Container>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Container maxW="container.xl" py={10}>
        <Box minH="50vh" display="flex" alignItems="center" justifyContent="center">
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" />
            <Text color="gray.500" fontSize="lg">Loading your profile...</Text>
          </VStack>
        </Box>
      </Container>
    );
  }

  // If not authenticated, redirect to appropriate login
  if (!user) {
    console.log('User not authenticated, redirecting to login');
    const loginPath = requireAdmin ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // If authenticated and meets requirements, render the protected content
  return children;
};

export default ProtectedRoute;
