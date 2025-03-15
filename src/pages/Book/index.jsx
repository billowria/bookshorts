import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Heading, 
  Image, 
  Link, 
  Spinner, 
  Alert, 
  AlertIcon,
  HStack, 
  Text, 
  Progress,
  IconButton,
  Flex,
  useColorModeValue,
  useBreakpointValue,
  Badge,
  Button,
  VStack,
  Icon,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  keyframes,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
} from '@chakra-ui/react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { FiArrowLeft, FiBookmark, FiShare2, FiClock, FiStar, FiEye, FiUser, FiMaximize, FiMinimize, FiMoon, FiSun, FiType } from 'react-icons/fi';
import useBookData from './useBookData';
import ContentSection from './ContentSection';
import { supabase } from '../../services/supabase';
import { incrementBookClicks } from '../../services/supabase';

const MotionBox = motion(Box);
const MotionContent = motion(Box);
const MotionContainer = motion(Container);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// Define animations
const scrollLineAnimation = keyframes`
  0% { transform: translateY(0); background-position: 0 0; }
  100% { transform: translateY(-100%); background-position: 0 100%; }
`;

const BookPage = () => {
  const { bookId } = useParams();
  const query = new URLSearchParams(useLocation().search);
  const section = query.get('section') || 'core';
  const { book, content, loading, error } = useBookData(bookId, section);
  const [readingProgress, setReadingProgress] = React.useState(0);
  const [bookData, setBookData] = useState(null);
  const toast = useToast();
  const containerRef = useRef(null);
  const [isContentFixed, setIsContentFixed] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [contentWidth, setContentWidth] = useState(80);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const contentRef = useRef(null);
  
  // Scroll animation setup
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Transform values based on scroll
  const backgroundScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.2]);
  const backgroundOpacity = useTransform(scrollYProgress, [0.3, 0.6], [1, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.2, 0.3], [100, 0]);
  const detailsOpacity = useTransform(scrollYProgress, [0.6, 0.7], [0, 1]);
  const detailsScale = useTransform(scrollYProgress, [0.6, 0.7], [0.8, 1]);
  
  // Move all color mode hooks to top level to ensure consistent order
  const coverSize = useBreakpointValue({ base: '150px', md: '250px' });
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.50 0%, purple.50 100%)',
    'linear(to-r, gray.800 0%, gray.900 100%)'
  );
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Add new transform for navigation opacity
  const navigationOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);

  const handleProgressUpdate = () => {
    setReadingProgress(prev => (prev >= 100 ? 0 : prev + 25));
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data, error } = await supabase
          .from('Books')
          .select(`
            *,
            Categories (
              id,
              name
            )
          `)
          .eq('id', bookId)
          .single();

        if (error) throw error;

        setBookData(data);
        
        // Increment click count
        await incrementBookClicks(bookId);
      } catch (error) {
        console.error('Error fetching book:', error);
        toast({
          title: 'Error fetching book',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchBook();
  }, [bookId]);

  // Modify the scroll handler to use scroll position instead of getBoundingClientRect
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const triggerPoint = window.innerHeight * 1.8; // Approximately where the actor section starts
      setIsContentFixed(scrollPosition >= triggerPoint);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" thickness="3px" color="blue.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" variant="left-accent" borderRadius="md" my={6}>
        <AlertIcon />
        Error loading book: {error.message}
      </Alert>
    );
  }

  if (!bookData) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text>Book not found</Text>
      </Container>
    );
  }

  return (
    <Box
      ref={containerRef}
      minH="300vh"
      bg="black"
      color="white"
      position="relative"
    >
      {/* Navigation Buttons - Fixed Position with Scroll-based Visibility */}
      <MotionBox
        position="fixed"
        bottom="6"
        left="50%"
        transform="translateX(-50%)"
        zIndex={100}
        bg="blackAlpha.900"
        backdropFilter="blur(12px)"
        borderRadius="full"
        boxShadow="dark-lg"
        px={8}
        py={4}
        style={{
          opacity: navigationOpacity
        }}
        initial={{ opacity: 0 }}
      >
        <HStack spacing={4} justify="center">
          <Link
            as={RouterLink}
            to={`/book/${bookId}?section=core`}
            px={4}
            py={2}
            borderRadius="full"
            fontWeight="semibold"
            bg={section === 'core' ? 'blue.500' : 'whiteAlpha.100'}
            color="white"
            _hover={{
              textDecoration: 'none',
              bg: section === 'core' ? 'blue.600' : 'whiteAlpha.300'
            }}
            transition="all 0.2s"
          >
            Core
            <Badge ml={2} colorScheme="blue" variant="solid">
              Summary
            </Badge>
          </Link>
          <Link
            as={RouterLink}
            to={`/book/${bookId}?section=deep_dive`}
            px={4}
            py={2}
            borderRadius="full"
            fontWeight="semibold"
            bg={section === 'deep_dive' ? 'purple.500' : 'whiteAlpha.100'}
            color="white"
            _hover={{
              textDecoration: 'none',
              bg: section === 'deep_dive' ? 'purple.600' : 'whiteAlpha.300'
            }}
            transition="all 0.2s"
          >
            Deep
            <Badge ml={2} colorScheme="purple" variant="solid">
              Detailed
            </Badge>
          </Link>
        </HStack>
      </MotionBox>

      {/* Background Section */}
      <MotionBox
        position="fixed"
        top={0}
        left={0}
        right={0}
        height="100vh"
        style={{
          scale: backgroundScale,
          opacity: backgroundOpacity
        }}
      >
        <Image
          src={bookData.cover_image || "/images/book-placeholder.jpg"}
          alt={bookData.title}
          objectFit="cover"
          w="100%"
          h="100%"
          filter="brightness(0.7)"
        />
        <Box
          position="absolute"
          bottom="20%"
          left="10%"
          right="10%"
          textAlign="center"
        >
          <MotionHeading
            size="4xl"
            mb={4}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {bookData.title}
          </MotionHeading>
        </Box>
      </MotionBox>

      {/* Story Section (Book Details) */}
      <MotionContainer
        maxW="container.lg"
        position="relative"
        minH="100vh"
        pt="100vh"
        style={{
          opacity: contentOpacity,
          y: contentY
        }}
      >
        <VStack spacing={8} align="center" p={8}>
          <MotionHeading size="2xl" mb={6}>Book Details</MotionHeading>
          <Box
            bg="whiteAlpha.100"
            p={8}
            borderRadius="xl"
            backdropFilter="blur(10px)"
            maxW="600px"
            w="100%"
          >
            <VStack spacing={6} align="start">
              <HStack spacing={6} w="100%">
                <Image
                  src={bookData.cover_image || "/images/book-placeholder.jpg"}
                  alt={bookData.title}
                  boxSize="200px"
                  objectFit="cover"
                  borderRadius="lg"
                  boxShadow="dark-lg"
                />
                <VStack align="start" spacing={4}>
                  <Heading size="lg">{bookData.title}</Heading>
                  <HStack>
                    <Icon as={FiUser} />
                    <Text>Author: Unknown</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiStar} color="yellow.400" />
                    <Text>{bookData.avg_rating?.toFixed(1) || '0.0'} ({bookData.total_ratings || 0} ratings)</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiEye} />
                    <Text>{bookData.click_count || 0} views</Text>
                  </HStack>
                  <Badge colorScheme="purple" fontSize="md">
                    {bookData.Categories?.name}
                  </Badge>
                </VStack>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </MotionContainer>

      {/* Actor Section (Content) - Redesigned */}
      <Box
        ref={contentRef}
        position="relative"
        minH="100vh"
        width="100%"
        zIndex={2}
      >
        {/* Content Container */}
        <Box
          position={isContentFixed ? "fixed" : "relative"}
          top={isContentFixed ? "0" : "auto"}
          left="0"
          right="0"
          height={isContentFixed ? "100vh" : "auto"}
          width="100%"
          bg={isContentFixed ? "black" : "transparent"}
          overflowY={isContentFixed ? "auto" : "visible"}
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'whiteAlpha.100',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'whiteAlpha.300',
              borderRadius: '4px',
            },
            scrollBehavior: 'smooth',
          }}
          transition="all 0.3s ease"
        >
          {/* Reading Controls */}
          <Box
            position="fixed"
            right="4"
            top="50%"
            transform="translateY(-50%)"
            bg="blackAlpha.700"
            backdropFilter="blur(12px)"
            borderRadius="xl"
            p={4}
            zIndex={100}
            boxShadow="dark-lg"
          >
            <VStack spacing={4}>
              <Tooltip label="Font Size" placement="left">
                <Box>
                  <IconButton
                    icon={<FiType />}
                    variant="ghost"
                    color="white"
                    onClick={() => setFontSize(prev => Math.min(prev + 2, 24))}
                  />
                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    {fontSize}px
                  </Text>
                  <IconButton
                    icon={<FiType />}
                    variant="ghost"
                    color="white"
                    transform="scale(0.8)"
                    onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
                  />
                </Box>
              </Tooltip>
              <Tooltip label="Content Width" placement="left">
                <Box>
                  <IconButton
                    icon={<FiMaximize />}
                    variant="ghost"
                    color="white"
                    onClick={() => setContentWidth(prev => Math.min(prev + 5, 95))}
                  />
                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    {contentWidth}%
                  </Text>
                  <IconButton
                    icon={<FiMinimize />}
                    variant="ghost"
                    color="white"
                    onClick={() => setContentWidth(prev => Math.max(prev - 5, 50))}
                  />
                </Box>
              </Tooltip>
              <Tooltip label="Toggle Theme" placement="left">
                <IconButton
                  icon={isDarkMode ? <FiSun /> : <FiMoon />}
                  variant="ghost"
                  color="white"
                  onClick={() => setIsDarkMode(prev => !prev)}
                />
              </Tooltip>
            </VStack>
          </Box>

          {/* Content */}
          <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch" w={`${contentWidth}%`} mx="auto">
              <AnimatePresence mode="wait">
                <MotionContent
                  key={section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  bg={isDarkMode ? "whiteAlpha.100" : "white"}
                  p={8}
                  borderRadius="xl"
                  backdropFilter="blur(10px)"
                  maxW="container.lg"
                  mx="auto"
                  boxShadow="xl"
                >
                  <VStack spacing={6} align="stretch">
                    <Heading 
                      size="xl" 
                      textAlign="center" 
                      color={isDarkMode ? "white" : "gray.800"}
                    >
                      {section === 'core' ? 'Core Summary' : 'Deep Dive'}
                    </Heading>
                    <Box
                      bg={isDarkMode ? "whiteAlpha.200" : "gray.50"}
                      borderRadius="xl"
                      overflow="hidden"
                      sx={{
                        '.content-section': {
                          bg: 'transparent',
                          border: 'none',
                          boxShadow: 'none',
                          color: isDarkMode ? 'white' : 'gray.800',
                        },
                        '.html-content': {
                          color: isDarkMode ? 'white' : 'gray.800',
                          fontSize: `${fontSize}px`,
                          'h1, h2, h3, h4, h5, h6': {
                            color: isDarkMode ? 'white' : 'gray.800',
                          },
                          'p': {
                            color: isDarkMode ? 'whiteAlpha.900' : 'gray.700',
                            lineHeight: '1.8',
                          },
                          'a': {
                            color: isDarkMode ? 'blue.300' : 'blue.600',
                          },
                          'blockquote': {
                            borderLeftColor: isDarkMode ? 'whiteAlpha.300' : 'gray.200',
                            color: isDarkMode ? 'whiteAlpha.800' : 'gray.600',
                          },
                          'code': {
                            bg: isDarkMode ? 'whiteAlpha.200' : 'gray.100',
                            color: isDarkMode ? 'blue.300' : 'blue.600',
                          }
                        }
                      }}
                    >
                      <ContentSection 
                        content={content?.content}
                        lastUpdated={content?.last_updated ? new Date(content.last_updated) : new Date()}
                      />
                    </Box>
                  </VStack>
                </MotionContent>
              </AnimatePresence>

              <Box textAlign="center" mt={8}>
                <Text 
                  fontSize="lg" 
                  mb={4} 
                  color={isDarkMode ? "gray.300" : "gray.600"}
                >
                  {readingProgress}% Completed
                </Text>
                <Button 
                  colorScheme={isDarkMode ? "blue" : "purple"}
                  size="lg"
                  onClick={handleProgressUpdate}
                  leftIcon={<FiBookmark />}
                >
                  Mark as {readingProgress >= 100 ? 'Restart' : 'Completed'}
                </Button>
              </Box>
            </VStack>
          </Container>
        </Box>
      </Box>

      {/* Back Button */}
      <Button
        as={RouterLink}
        to="/"
        position="fixed"
        top={4}
        left={4}
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        color="white"
        _hover={{ bg: 'whiteAlpha.200' }}
        zIndex={100}
      >
        Back
      </Button>
    </Box>
  );
};

export default BookPage;