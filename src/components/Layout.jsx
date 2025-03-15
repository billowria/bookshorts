import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  Text,
  Stack,
  useColorMode,
  IconButton,
  Spacer,
} from '@chakra-ui/react';
import { FiSun, FiMoon, FiHome, FiSettings } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { loading } = useAuth();

  return (
    <Box
      minH="100vh"
      bgGradient={`linear(to-br, var(--gradient-start), var(--gradient-end))`}
      transition="all 0.2s"
      display="flex"
      flexDirection="column"
    >
      <Flex
        as="header"
        position="fixed"
        w="full"
        top={0}
        zIndex={1000}
        bg={colorMode === 'light' ? 'whiteAlpha.800' : 'blackAlpha.800'}
        backdropFilter="blur(10px)"
        borderBottom="1px"
        borderColor="border.default"
        py={4}
      >
        <Container maxW="container.xl">
          <Flex align="center" justify="space-between">
            <Stack direction="row" spacing={4} align="center">
              <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                <Heading
                  size="md"
                  bgGradient="linear(to-r, brand.500, accent.500)"
                  bgClip="text"
                >
                  BookShorts
                </Heading>
              </Link>
              <Stack direction="row" spacing={4}>
                <Link as={RouterLink} to="/" color="text.muted" _hover={{ color: 'brand.500' }}>
                  <Flex align="center">
                    <FiHome />
                    <Text ml={2}>Home</Text>
                  </Flex>
                </Link>
                <Link as={RouterLink} to="/admin" color="text.muted" _hover={{ color: 'brand.500' }}>
                  <Flex align="center">
                    <FiSettings />
                    <Text ml={2}>Admin</Text>
                  </Flex>
                </Link>
              </Stack>
            </Stack>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              colorScheme="brand"
            />
          </Flex>
        </Container>
      </Flex>

      <Box as="main" pt={20} flex="1">
        <Outlet />
      </Box>

      <Box
        as="footer"
        bg={colorMode === 'light' ? 'whiteAlpha.800' : 'blackAlpha.800'}
        backdropFilter="blur(10px)"
        py={4}
        borderTop="1px"
        borderColor="border.default"
      >
        <Container maxW="container.xl">
          <Text textAlign="center" color="text.muted">
            &copy; {new Date().getFullYear()} BookShorts. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 