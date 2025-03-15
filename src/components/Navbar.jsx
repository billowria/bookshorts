import React from 'react';
import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useColorMode,
  Container,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Text,
  HStack,
  Tooltip
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiUser, FiLogOut, FiBookmark, FiSettings, FiShield } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <Box
      bg={bg}
      px={4}
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justify="space-between">
          <HStack spacing={8} alignItems="center">
            <Box as={RouterLink} to="/" fontWeight="bold" fontSize="xl">
              BookShorts
            </Box>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              <Button as={RouterLink} to="/" variant="ghost">
                Home
              </Button>
              <Button as={RouterLink} to="/books" variant="ghost">
                All Books
              </Button>
            </HStack>
          </HStack>

          <Stack direction="row" spacing={4} alignItems="center">
            <IconButton
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
              aria-label="Toggle color mode"
            />

            {user ? (
              <Menu>
                <MenuButton>
                  <Avatar
                    size="sm"
                    name={user.email}
                    src={user.user_metadata?.avatar_url}
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile" icon={<FiUser />}>
                    Profile
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/bookmarks" icon={<FiBookmark />}>
                    Bookmarks
                  </MenuItem>
                  
                  {isAdmin && (
                    <>
                      <MenuDivider />
                      <MenuItem 
                        as={RouterLink} 
                        to="/admin" 
                        icon={<FiShield />}
                        color="blue.500"
                      >
                        Admin Dashboard
                      </MenuItem>
                    </>
                  )}
                  
                  <MenuDivider />
                  <MenuItem onClick={signOut} icon={<FiLogOut />} color="red.400">
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                as={RouterLink}
                to="/login"
                colorScheme="brand"
              >
                Sign In
              </Button>
            )}
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar; 