import React from 'react';
import Slider from 'react-slick';
import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Badge,
  Button,
  Tooltip,
  useBreakpointValue,
  AspectRatio
} from '@chakra-ui/react';
import { FiBookmark, FiChevronLeft, FiChevronRight, FiStar, FiEye } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MotionBox = motion(Box);

// Custom arrow components for the carousel
const PrevArrow = ({ onClick }) => (
  <IconButton
    aria-label="Previous slide"
    icon={<FiChevronLeft />}
    onClick={onClick}
    position="absolute"
    left={-13}
    top="50%"
    transform="translateY(-50%)"
    zIndex={2}
    rounded="full"
    bg="rgba(49, 130, 206, 0.3)" // Translucent blue
    color="white"
    boxShadow="lg"
    _hover={{ 
      bg: 'blue.500', // Solid blue on hover
      transform: "translateY(-50%) scale(1.2)" 
    }}    size="lg"
    transition="all 0.2s ease"
  />
);

const NextArrow = ({ onClick }) => (
  <IconButton
    aria-label="Next slide"
    icon={<FiChevronRight />}
    onClick={onClick}
    position="absolute" 
    right={-13}
    top="50%"
    transform="translateY(-50%)"
    zIndex={2}
    rounded="full"
    bg="rgba(49, 130, 206, 0.3)" // Translucent blue
    color="white"
    boxShadow="lg"
    _hover={{ 
      bg: 'blue.500', // Solid blue on hover
      transform: "translateY(-50%) scale(1.2)" 
    }}
    size="lg"
    transition="all 0.2s ease"
  />
);

const BookCard = motion(React.forwardRef(({ book, isBookmarked, onBookmarkToggle, ...props }, ref) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const categoryColor = useColorModeValue('blue.100', 'blue.800');
  const ratingBg = useColorModeValue('yellow.100', 'yellow.900');

  return (
    <Box ref={ref} {...props}>
      <VStack
        as={RouterLink}
        to={`/book/${book.id}`}
        spacing={0}
        align="stretch"
        bg={cardBg}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
        position="relative"
        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        transform="perspective(1000px)"
        _hover={{
          transform: "perspective(1000px) rotateY(10deg) translateZ(30px) translateX(10px)",
          boxShadow: "2xl",
        }}
        h="300px"
        w="230px"
        role="group"
        mx="auto"
      >
        {/* Train ticket top strip with animation */}
        <Box
          bg="blue.500"
          h="8px"
          w="100%"
          position="absolute"
          top={0}
          left={0}
          zIndex={1}
          _groupHover={{ bg: 'purple.500' }}
          transition="all 0.3s ease"
          sx={{
            background: 'linear-gradient(90deg, blue.500 25%, purple.500 50%, blue.500 75%)',
            backgroundSize: '200% 100%',
            animation: 'slideGradient 3s linear infinite',
            '@keyframes slideGradient': {
              '0%': { backgroundPosition: '0% 0%' },
              '100%': { backgroundPosition: '200% 0%' }
            }
          }}
        />

        <AspectRatio ratio={1} maxH="160px">
          <Box position="relative">
            <Image
              src={book.cover_image || "/images/book-placeholder.jpg"}
              alt={book.title}
              objectFit="cover"
              w="100%"
              h="100%"
              transition="transform 0.5s ease"
              _groupHover={{ transform: 'scale(1.1)' }}
            />
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)"
              opacity={1}
              transition="opacity 0.3s"
            />
          </Box>
        </AspectRatio>

        <VStack 
          p={3} 
          spacing={2} 
          flex={1}
          align="stretch"
          position="relative"
          bg={cardBg}
        >
          <HStack justify="space-between" align="center">
            <Badge
              colorScheme="blue"
              variant="subtle"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
            >
              {book.category || 'Fiction'}
            </Badge>
            <Badge
              display="flex"
              alignItems="center"
              px={2}
              py={1}
              borderRadius="full"
              bg={ratingBg}
              color={textColor}
            >
              <FiStar style={{ marginRight: '4px' }} />
              {book.avg_rating?.toFixed(1) || 'N/A'}
            </Badge>
          </HStack>

          <Text
            fontWeight="bold"
            fontSize="md"
            color={textColor}
            noOfLines={2}
            mb={1}
          >
            {book.title}
          </Text>

          <Text fontSize="sm" color="gray.500" noOfLines={1}>
            {book.author || 'Unknown Author'}
          </Text>

          <IconButton
            position="absolute"
            bottom={3}
            right={3}
            icon={<FiBookmark />}
            size="sm"
            aria-label="Bookmark"
            onClick={(e) => {
              e.preventDefault();
              onBookmarkToggle(book.id);
            }}
            colorScheme={isBookmarked ? 'purple' : 'gray'}
            variant={isBookmarked ? 'solid' : 'outline'}
            opacity={0.8}
            _groupHover={{ 
              opacity: 1,
              transform: "scale(1.1)",
            }}
            transition="all 0.3s ease"
          />
        </VStack>

        {/* Train ticket bottom strip with animation */}
        <Box
          bg="blue.500"
          h="8px"
          w="100%"
          position="absolute"
          bottom={0}
          left={0}
          zIndex={1}
          _groupHover={{ bg: 'purple.500' }}
          transition="all 0.3s ease"
          sx={{
            background: 'linear-gradient(90deg, blue.500 25%, purple.500 50%, blue.500 75%)',
            backgroundSize: '200% 100%',
            animation: 'slideGradient 3s linear infinite',
            '@keyframes slideGradient': {
              '0%': { backgroundPosition: '0% 0%' },
              '100%': { backgroundPosition: '200% 0%' }
            }
          }}
        />
      </VStack>
    </Box>
  );
}));

function FeaturedBooksCarousel({ books, bookmarks, onBookmarkToggle }) {
  const slidesToShow = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4, xl: 5 });

  const settings = {
    dots: true,
    infinite: true,
    speed:1000,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <Box 
      position="relative" 
      px={{ base: 4, md: 8, lg: 12 }} 
      py={4}
      mx="auto"
      maxW="100vw"
      overflow="hidden"
    >
      <Box
        sx={{
          '.slick-track': {
            display: 'flex',
            gap: { base: '10px', md: '20px' },
          },
          '.slick-slide': {
            px: { base: 1, md: 2 },
          },
          '.slick-list': {
            mx: { base: '-10px', md: '-20px' },
            overflow: 'hidden',
          },
          '.slick-arrow': {
            display: { base: 'none', md: 'block' }
          }
        }}
      >
        <Slider {...settings}>
          {books.map((book) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              style={{ margin: '0 auto' }}
            >
              <BookCard
                book={book}
                isBookmarked={bookmarks.has(book.id)}
                onBookmarkToggle={onBookmarkToggle}
              />
            </motion.div>
          ))}
        </Slider>
      </Box>
    </Box>
  );
}

export default FeaturedBooksCarousel; 