import { useState, useRef, useEffect } from 'react';
import { 
  Box, Container, Heading, Text, Button, Grid, Flex, Icon, 
  Input, InputGroup, InputLeftElement, InputRightElement, 
  Tag, TagLabel, TagLeftIcon, Stack, useDisclosure,
  SlideFade, Fade, ScaleFade, useBreakpointValue,
  HStack, keyframes, Image, AspectRatio
} from '@chakra-ui/react';
import { FiSearch, FiArrowRight, FiBook, FiUsers, FiStar, FiBookOpen } from 'react-icons/fi';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MotionBox = motion(Box);

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const scrollAnimation = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`;

const lineAnimation = keyframes`
  0% { transform: translateY(0); background-position: 0 0; }
  50% { background: linear-gradient(to bottom, transparent 0%, #6D28D9 20%, #4F46E5 80%, transparent 100%); }
  100% { transform: translateY(-100%); background-position: 0 100%; }
`;

const HeroSection = ({ books = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onToggle } = useDisclosure();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Demo data
  const stats = [
    { icon: FiBook, value: '25K+', label: 'Book Summaries' },
    { icon: FiUsers, value: '1M+', label: 'Monthly Readers' },
    { icon: FiStar, value: '4.9', label: 'Average Rating' }
  ];

  const trendingBooks = [
    { id: 1, title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', color: 'rgba(79, 70, 229, 0.1)' },
    { id: 2, title: 'Sapiens', author: 'Yuval Noah Harari', category: 'History', color: 'rgba(236, 72, 153, 0.1)' },
    { id: 3, title: 'Dune', author: 'Frank Herbert', category: 'Sci-Fi', color: 'rgba(245, 158, 11, 0.1)' },
    { id: 4, title: 'Ikigai', author: 'Héctor García', category: 'Philosophy', color: 'rgba(16, 185, 129, 0.1)' }
  ];

  const categories = [
    'Business', 'Psychology', 'Technology', 'Biography', 
    'Science', 'Productivity', 'Philosophy', 'Fiction'
  ];

  const carouselSettings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    vertical: true,
    verticalSwiping: true,
    centerMode: true,
    centerPadding: '0px',
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    pauseOnHover: true,
    arrows: false,
    beforeChange: (current, next) => {
      // You can add logic here if needed
    }
  };

  const [visibleBooks, setVisibleBooks] = useState([]);
  const [activeIndex, setActiveIndex] = useState(2); // Middle index for 5 visible items

  useEffect(() => {
    if (books.length > 0) {
      // Create a duplicated array for seamless scrolling
      const duplicatedBooks = [...books, ...books, ...books];
      setVisibleBooks(duplicatedBooks);
    }
  }, [books]);

  return (
    <Box 
      ref={ref}
      position="relative" 
      h={{ base: 'auto', md: '85vh' }}
      minH="500px"
      bgImage="linear-gradient(to right, #f6f9fc, #ffffff)"
      bgSize="cover"
      bgPosition="center"
      overflow="hidden"
      mt={{ base: 2, md: 4 }}
    >
      {/* Enhanced Parallax Background */}
      <MotionBox
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        style={{ y }}
        bgGradient="linear(to-r, rgba(255,255,255,0.9), rgba(246,249,252,0.9))"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgImage: 'url("/images/pattern-dots.svg")',
          opacity: 0.1,
          animation: `${floatAnimation} 20s linear infinite`
        }}
      />

      <Container 
        maxW="container.xl" 
        position="relative" 
        h="full" 
        px={{ base: 4, sm: 6, md: 8, lg: 12 }}
        py={{ base: 6, sm: 8, md: 10, lg: 12 }}
        mx="auto"
      >
        <Grid
          templateColumns={{ base: '1fr', md: '1.2fr 1fr' }}
          gap={12}
          h="full"
          alignItems="center"
        >
          {/* Left Content */}
          <Flex direction="column" gap={8} color="gray.800" zIndex={2}>
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Heading
                as="h1"
                fontSize={{ base: '4xl', md: '6xl' }}
                lineHeight="1.1"
                fontWeight="800"
                maxW="800px"
              >
                Master Literature in
                <Box 
                  as="span" 
                  bgGradient="linear(120deg, #4F46E5, #7C3AED)"
                  bgClip="text"
                  position="relative"
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    width: 'full',
                    height: '2px',
                    bgGradient: 'linear(120deg, #4F46E5, #7C3AED)',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s ease',
                  }}
                  _hover={{
                    _after: {
                      transform: 'scaleX(1)',
                    }
                  }}
                > Minutes</Box>, Not Days
              </Heading>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600">
                Unlock key insights from best-selling books with expert-curated summaries, 
                interactive learning tools, and personalized recommendations.
              </Text>
            </MotionBox>

            {/* Enhanced Search Bar */}
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              w="100%"
              maxW="600px"
            >
              <InputGroup 
                size="lg"
                boxShadow="xl"
                borderRadius="full"
                overflow="hidden"
                bg="white"
                position="relative"
              >
                <InputLeftElement 
                  pointerEvents="none"
                  h="full"
                  pl={4}
                >
                  <Icon as={FiSearch} color="gray.400" boxSize={5} />
                </InputLeftElement>
                <Input
                  placeholder="Search books, authors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="unstyled"
                  pl={12}
                  pr={32}
                  py={6}
                  color="gray.800"
                  fontSize={{ base: 'md', md: 'lg' }}
                  _placeholder={{ color: 'gray.400' }}
                  onFocus={onToggle}
                />
                <InputRightElement 
                  width="auto"
                  h="full"
                  pr={2}
                >
                  <Button
                    as={Link}
                    to="/search"
                    bgGradient="linear(to-r, #4F46E5, #7C3AED)"
                    color="white"
                    rightIcon={<FiArrowRight />}
                    size="lg"
                    borderRadius="full"
                    px={8}
                    _hover={{
                      bgGradient: "linear(to-r, #4338CA, #6D28D9)",
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                  >
                    Explore
                  </Button>
                </InputRightElement>
              </InputGroup>
            </MotionBox>

            {/* Stats */}
            <Flex gap={6} wrap="wrap">
              {stats.map((stat, index) => (
                <MotionBox
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Flex 
                    align="center" 
                    gap={3}
                    bg="white"
                    p={4}
                    borderRadius="xl"
                    boxShadow="md"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >
                    <Icon as={stat.icon} boxSize={6} color="#4F46E5" />
                    <Flex direction="column">
                      <Text fontSize="2xl" fontWeight="700" color="gray.800">{stat.value}</Text>
                      <Text fontSize="sm" color="gray.600">{stat.label}</Text>
                    </Flex>
                  </Flex>
                </MotionBox>
              ))}
            </Flex>

            {/* Trending Categories */}
            <Flex direction="column" gap={4}>
              <Text fontWeight="600" opacity={0.9}>Popular Categories:</Text>
              <Flex gap={3} wrap="wrap">
                {categories.map((category, index) => (
                  <MotionBox
                    key={category}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.5 }}
                  >
                    <Tag
                      as={Link}
                      to={`/category/${category.toLowerCase()}`}
                      variant="subtle"
                      colorScheme="brand"
                      size="lg"
                      borderRadius="full"
                      px={6}
                      py={2}
                      _hover={{ 
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg'
                      }}
                      transition="all 0.2s"
                    >
                      <TagLabel>{category}</TagLabel>
                    </Tag>
                  </MotionBox>
                ))}
              </Flex>
            </Flex>
          </Flex>

          {/* Right Content - Featured Books Carousel */}
          {!isMobile && (
            <Flex
              position="relative"
              h="700px"
              align="center"
              justify="flex-end"
              overflow="hidden"
              pr={8}
            >
              <Box
                w="320px"
                h="700px"
                position="relative"
                overflow="hidden"
                role="group"
                pl={1}
              >
                {/* Animated Line */}
                <Box
                  position="absolute"
                  left={0}
                  top={0}
                  w="3px"
                  h="200%"
                  bgGradient="linear(to-b, transparent 0%, #4F46E5 20%, #6D28D9 80%, transparent 100%)"
                  animation={`${lineAnimation} 12s linear infinite`}
                  opacity={0.7}
                  zIndex={1}
                  boxShadow="0 0 10px rgba(79, 70, 229, 0.3)"
                />

                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  h="150px"
                  bgGradient="linear(to-b, white, transparent)"
                  zIndex={2}
                  pointerEvents="none"
                />
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  h="150px"
                  bgGradient="linear(to-t, white, transparent)"
                  zIndex={2}
                  pointerEvents="none"
                />

                <AnimatePresence>
                  <MotionBox
                    position="absolute"
                    top={0}
                    left={6}
                    right={0}
                    animate={{
                      y: ["0%", "-50%"]
                    }}
                    transition={{
                      y: {
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }
                    }}
                    sx={{
                      "&:hover": {
                        animationPlayState: "paused"
                      }
                    }}
                  >
                    {visibleBooks.map((book, index) => (
                      <MotionBox
                        key={`${book.id}-${index}`}
                        mb={6}
                        position="relative"
                        w="240px"
                        h="360px"
                        overflow="hidden"
                        bg="rgba(0, 178, 255, 0.1)"
                        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                        transform="perspective(1000px)"
                        boxShadow="0 8px 25px -5px rgba(0, 178, 255, 0.3)"
                        sx={{
                          '--card-radius': 'var(--chakra-radii-2xl)',
                          borderRadius: 'var(--card-radius)'
                        }}
                        _before={{
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.8) 100%)',
                          zIndex: 1,
                          opacity: 1
                        }}
                        _hover={{
                          transform: 'perspective(1000px) rotateX(5deg) scale(1.05)',
                          boxShadow: '0 20px 40px -10px rgba(0, 178, 255, 0.4)',
                          '& img': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {/* Book Cover Image */}
                        <Image
                          src={book.image_url || book.cover_image || "/images/book-placeholder.jpg"}
                          alt={book.title}
                          position="absolute"
                          top={0}
                          left={0}
                          w="full"
                          h="full"
                          objectFit="cover"
                          transition="transform 0.5s"
                        />

                        {/* Overlay Content */}
                        <Flex
                          className="book-info"
                          position="absolute"
                          bottom={0}
                          left={0}
                          right={0}
                          direction="column"
                          p={6}
                          color="white"
                          zIndex={2}
                          opacity={1}
                          transform="translateY(0)"
                          bgGradient="linear(to-t, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)"
                        >
                          <Text
                            fontSize="xl"
                            fontWeight="700"
                            mb={2}
                            noOfLines={2}
                            textShadow="0 2px 4px rgba(0,0,0,0.3)"
                          >
                            {book.title}
                          </Text>
                          <Text
                            fontSize="md"
                            fontWeight="500"
                            mb={3}
                            opacity={0.9}
                          >
                            {book.author}
                          </Text>
                          <Flex justify="space-between" align="center">
                            <Text
                              px={3}
                              py={1}
                              fontSize="sm"
                              fontWeight="600"
                              bg="rgba(255,255,255,0.2)"
                              borderRadius="full"
                              backdropFilter="blur(4px)"
                            >
                              {book.category?.name || 'General'}
                            </Text>
                            {book.avg_rating && (
                              <HStack 
                                spacing={1}
                                px={3}
                                py={1}
                                bg="rgba(255,255,255,0.2)"
                                borderRadius="full"
                                backdropFilter="blur(4px)"
                              >
                                <Icon as={FiStar} color="yellow.400" boxSize={4} />
                                <Text fontSize="sm" fontWeight="700">
                                  {book.avg_rating.toFixed(1)}
                                </Text>
                              </HStack>
                            )}
                          </Flex>
                        </Box>
                      </MotionBox>
                    ))}
                  </MotionBox>
                </AnimatePresence>
              </Box>
            </Flex>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;