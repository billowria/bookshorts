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
  Tooltip,
  chakra
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiUser, FiLogOut, FiBookmark, FiSettings, FiShield } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = chakra(motion.div);
const MotionFlex = chakra(motion.div);
const MotionButton = chakra(motion.button);

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, signOut, isAdmin } = useAuth();
  const location = useLocation();
  
  const bg = useColorModeValue(
    'rgba(255, 253, 247, 0.8)',  // Light cream with transparency
    'rgba(26, 32, 44, 0.8)'      // Dark mode with transparency
  );
  const borderColor = useColorModeValue(
    'rgba(237, 233, 224, 0.6)',  // Light border
    'rgba(45, 55, 72, 0.6)'      // Dark border
  );
  const buttonHoverBg = useColorModeValue(
    'rgba(237, 233, 224, 0.8)',  // Light hover
    'rgba(45, 55, 72, 0.8)'      // Dark hover
  );

  // Don't show navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  const navVariants = {
    hidden: { y: -100 },
    visible: { 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  const logoVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={navVariants}
      bg={bg}
      px={4}
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottom="1px"
      borderColor={borderColor}
      backdropFilter="blur(10px)"
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justify="space-between">
          <HStack spacing={8} alignItems="center">
            <MotionBox
              as={RouterLink}
              to="/"
              fontWeight="bold"
              fontSize="xl"
              variants={logoVariants}
              whileHover="hover"
              cursor="pointer"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
            >
              BookShorts
            </MotionBox>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              <MotionButton
                as={RouterLink}
                to="/"
                variant="ghost"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                px={4}
                py={2}
                borderRadius="full"
                _hover={{ bg: buttonHoverBg }}
              >
                Home
              </MotionButton>
              <MotionButton
                as={RouterLink}
                to="/books"
                variant="ghost"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                px={4}
                py={2}
                borderRadius="full"
                _hover={{ bg: buttonHoverBg }}
              >
                All Books
              </MotionButton>
            </HStack>
          </HStack>

          <Stack direction="row" spacing={4} alignItems="center">
            <MotionBox
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <IconButton
                icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                onClick={toggleColorMode}
                variant="ghost"
                aria-label="Toggle color mode"
                borderRadius="full"
                _hover={{ bg: buttonHoverBg }}
              />
            </MotionBox>

            <AnimatePresence>
              {user ? (
                <Menu>
                  <MenuButton
                    as={MotionBox}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Avatar
                      size="sm"
                      name={user.email}
                      src={user.user_metadata?.avatar_url}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ 
                        transform: 'scale(1.1)',
                        boxShadow: 'lg'
                      }}
                    />
                  </MenuButton>
                  <MenuList
                    bg={useColorModeValue('rgba(255, 253, 247, 0.95)', 'rgba(26, 32, 44, 0.95)')}
                    borderColor={borderColor}
                    backdropFilter="blur(10px)"
                    boxShadow="lg"
                    borderRadius="xl"
                    p={2}
                  >
                    <MenuItem 
                      as={RouterLink} 
                      to="/profile" 
                      icon={<FiUser />}
                      borderRadius="lg"
                      _hover={{ bg: buttonHoverBg }}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem 
                      as={RouterLink} 
                      to="/bookmarks" 
                      icon={<FiBookmark />}
                      borderRadius="lg"
                      _hover={{ bg: buttonHoverBg }}
                    >
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
                          borderRadius="lg"
                          _hover={{ bg: buttonHoverBg }}
                        >
                          Admin Dashboard
                        </MenuItem>
                      </>
                    )}
                    
                    <MenuDivider />
                    <MenuItem 
                      onClick={signOut} 
                      icon={<FiLogOut />} 
                      color="red.400"
                      borderRadius="lg"
                      _hover={{ bg: buttonHoverBg }}
                    >
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <MotionButton
                  as={RouterLink}
                  to="/login"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    colorScheme="brand"
                    borderRadius="full"
                    px={6}
                    bgGradient="linear(to-r, blue.400, purple.500)"
                    _hover={{
                      bgGradient: "linear(to-r, blue.500, purple.600)",
                      transform: "translateY(-2px)",
                      boxShadow: "lg"
                    }}
                  >
                    Sign In
                  </Button>
                </MotionButton>
              )}
            </AnimatePresence>
          </Stack>
        </Flex>
      </Container>
    </MotionBox>
  );
};

export default Navbar; 