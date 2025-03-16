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
  InputRightElement,
  Divider,
  Icon,
  SimpleGrid,
  Stack,
  Avatar,
  AvatarGroup,
  useBreakpointValue,
  IconButton,
  Flex,
  chakra
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = chakra(motion.div);
const MotionFlex = chakra(motion.div);

const avatars = [
  {
    name: 'Reader 1',
    url: 'https://bit.ly/ryan-florence',
  },
  {
    name: 'Reader 2',
    url: 'https://bit.ly/sage-adebayo',
  },
  {
    name: 'Reader 3',
    url: 'https://bit.ly/kent-c-dodds',
  },
  {
    name: 'Reader 4',
    url: 'https://bit.ly/prosper-baba',
  },
  {
    name: 'Reader 5',
    url: 'https://bit.ly/code-beast',
  },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const inputFocusBg = useColorModeValue('gray.100', 'gray.600');

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

        setIsSignUp(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        const isAdmin = profileData?.role === 'admin';

        if (isAdmin) {
          navigate('/admin');
          toast({
            title: `Welcome ${data.user.user_metadata?.full_name?.split(' ')[0] || 'User'}`,
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
          _hover={{ boxShadow: '2xl' }}
          transition="all 0.3s ease"
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
                      <Icon as={FiUser} color="gray.500" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={isSignUp}
                      placeholder="Your full name"
                      bg={inputBg}
                      border={0}
                      _focus={{ 
                        bg: inputFocusBg,
                        borderColor: 'purple.500'
                      }}
                    />
                  </InputGroup>
                </FormControl>
              )}

              <FormControl isInvalid={!!error}>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiMail} color="gray.500" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Your email address"
                    bg={inputBg}
                    border={0}
                    _focus={{ 
                      bg: inputFocusBg,
                      borderColor: 'purple.500'
                    }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isInvalid={!!error}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiLock} color="gray.500" />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={isSignUp ? "Create a password" : "Enter your password"}
                    bg={inputBg}
                    border={0}
                    _focus={{ 
                      bg: inputFocusBg,
                      borderColor: 'purple.500'
                    }}
                  />
                  <InputRightElement>
                    <IconButton
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    />
                  </InputRightElement>
                </InputGroup>
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>

              <Button
                type="submit"
                size="lg"
                fontSize="md"
                isLoading={loading}
                w="full"
                bgGradient="linear(to-r, purple.400,pink.400)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, purple.500,pink.500)",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </VStack>
          </form>

          <Divider />
          
          <HStack justify="center" width="100%">
            <Text color={mutedColor}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <ChakraLink
              onClick={toggleMode}
              color="purple.400"
              fontWeight="medium"
              _hover={{
                color: 'purple.500',
                textDecoration: 'none'
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </ChakraLink>
          </HStack>
        </MotionFlex>
      </Container>
    </MotionBox>
  );
};

export default Login;