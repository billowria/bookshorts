// src/pages/Home/index.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  VStack,
  HStack,
  Image,
  Flex,
  useColorModeValue,
  Badge,
  Stack,
  Icon,
  AspectRatio,
  Spinner,
  Alert,
  AlertIcon,
  IconButton,
  useToast,
  Tooltip,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FiBook, FiStar, FiArrowRight, FiBookmark } from 'react-icons/fi';
import { 
  fetchCategories, 
  fetchFeaturedBooks, 
  toggleBookmark, 
  incrementBookClicks, 
  incrementCategoryClicks,
  getUserBookmarks 
} from '../../services/supabase';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import FeaturedBooksCarousel from '../../components/FeaturedBooksCarousel';
import HeroSection from '../../components/HeroSection';

const MotionBox = motion(Box);

const DEFAULT_CATEGORY_IMAGE = 'https://yggftjdbznludnoqukzf.supabase.co/storage/v1/object/public/book-covers/s9i5s7r03n_1741745341926.jpg';

const GenreCard = ({ id, title, to, imageUrl, onClick }) => (
  <Link to={to} onClick={() => onClick && onClick(id)}>
    <Box 
      position="relative" 
      overflow="hidden" 
      borderRadius="xl" 
      cursor="pointer"
      h="200px"
      transition="0.3s"
      _hover={{ 
        transform: 'translateY(-4px)',
        shadow: 'xl'
      }}
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundImage={`url(${imageUrl || DEFAULT_CATEGORY_IMAGE})`}
        backgroundSize="cover"
        backgroundPosition="center"
      />
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Text 
          fontSize="2xl" 
          fontWeight="bold" 
          color="white" 
          textAlign="center"
        >
          {title}
        </Text>
      </Box>
    </Box>
  </Link>
);

const FeaturedBookCard = ({ id, title, image, avgRating, isBookmarked, onBookmarkToggle, cardBg }) => {
  const handleClick = () => {
    incrementBookClicks(id);
  };

  const bookmarkBgActive = useColorModeValue('brand.500', 'brand.400');
  const bookmarkBgInactive = useColorModeValue('gray.100', 'gray.700');
  const bookmarkColorActive = useColorModeValue('white', 'white');
  const bookmarkColorInactive = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      overflow="hidden"
      shadow="lg"
      transition="0.3s"
      position="relative"
      _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
    >
      <Tooltip 
        label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        placement="top"
        hasArrow
      >
        <IconButton
          icon={<FiBookmark />}
          aria-label="Bookmark"
          position="absolute"
          top={2}
          right={2}
          zIndex={2}
          size="sm"
          bg={isBookmarked ? bookmarkBgActive : bookmarkBgInactive}
          color={isBookmarked ? bookmarkColorActive : bookmarkColorInactive}
          borderRadius="full"
          shadow={isBookmarked ? "md" : "none"}
          _hover={{ 
            transform: 'scale(1.1)',
            bg: isBookmarked ? 'brand.600' : 'gray.300',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBookmarkToggle && onBookmarkToggle(id);
          }}
        />
      </Tooltip>
      
      <AspectRatio ratio={4/3}>
        <Image src={image} alt={title} objectFit="cover" />
      </AspectRatio>
      <Box p={4}>
        <HStack justify="space-between" mb={2}>
          <HStack spacing={2}>
            <Badge colorScheme="yellow" variant="solid" borderRadius="full">
              {avgRating ? avgRating.toFixed(1) : 'N/A'}
            </Badge>
            <Icon as={FiStar} color="yellow.400" />
          </HStack>
        </HStack>
        <Heading size="md" mb={4} noOfLines={2}>{title}</Heading>
        <HStack justify="flex-end" align="center">
          <Button 
            size="sm" 
            rightIcon={<FiArrowRight />} 
            variant="ghost"
            as={Link}
            to={`/book/${id}`}
            onClick={handleClick}
          >
            View
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const bgGradient = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.800');
  const dealsBg = useColorModeValue('gray.100', 'gray.700');
  const toast = useToast();

  useEffect(() => {
    console.log('Home: Effect started', { authLoading, userId: user?.id });
    
    const fetchData = async () => {
      try {
        console.log('Home: Starting data fetch');
        setLoading(true);
        
        // Fetch categories and books in parallel
        console.log('Home: Fetching categories and books');
        const [categoriesResult, booksResult] = await Promise.all([
          fetchCategories(),
          fetchFeaturedBooks()
        ]);

        console.log('Home: Categories result:', { success: !categoriesResult.error });
        console.log('Home: Books result:', { success: !booksResult.error });

        if (categoriesResult.error) throw categoriesResult.error;
        if (booksResult.error) throw booksResult.error;

        setCategories(categoriesResult.data || []);
        setFeaturedBooks(booksResult.data || []);
        
        // Only fetch bookmarks if user is logged in
        if (user?.id) {
          console.log('Home: Fetching bookmarks for user:', user.id);
          const bookmarksResult = await getUserBookmarks(user.id);
          console.log('Home: Bookmarks result:', { success: !bookmarksResult.error });
          
          if (bookmarksResult.data) {
            const bookmarkIds = new Set(bookmarksResult.data.map(b => b.Books.id));
            setBookmarks(bookmarkIds);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Home: Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        console.log('Home: Setting loading to false');
        setLoading(false);
      }
    };

    // Only fetch data if auth is not loading

      fetchData();

    
  }, [user?.id, authLoading]);

  const handleBookmarkToggle = async (bookId) => {
    try {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to bookmark books',
          status: 'warning',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        return;
      }

      const { data, error } = await toggleBookmark(bookId, user.id);
      if (error) throw error;

      setBookmarks(prev => {
        const newBookmarks = new Set(prev);
        if (newBookmarks.has(bookId)) {
          newBookmarks.delete(bookId);
          // Show success notification for removing bookmark
          toast({
            title: 'Bookmark removed',
            description: 'Book has been removed from your bookmarks',
            status: 'success',
            duration: 2000,
            isClosable: true,
            position: 'top-right',
          });
        } else {
          newBookmarks.add(bookId);
          // Show success notification for adding bookmark
          toast({
            title: 'Book bookmarked!',
            description: 'Book has been added to your bookmarks',
            status: 'success',
            duration: 2000,
            isClosable: true,
            position: 'top-right',
          });
        }
        return newBookmarks;
      });
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to toggle bookmark',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  // Show loading state only when both auth and data are loading
  if (loading || authLoading) {
    return (
      <Box 
        minH="100vh" 
        bg={bgGradient} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text fontSize="lg" color="gray.500">Loading amazing content...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        minH="100vh" 
        bg={bgGradient} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        p={4}
      >
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="xl"
          p={8}
          maxW="xl"
        >
          <AlertIcon boxSize="40px" mr={0} mb={4} />
          <Heading size="lg" mb={2}>Error Loading Content</Heading>
          <Text mb={4}>{error}</Text>
          <Button
            colorScheme="red"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box bg={bgGradient}>
      {/* Hero Section */}
       <HeroSection
        books={featuredBooks}
       />

      <Container maxW="container.xl" py={16}>
        <VStack spacing={12}>
          {/* Top Genres Section */}
          {categories.length > 0 && (
            <Box width="100%">
              <Heading size="xl" mb={8}>Top genres</Heading>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
                {categories
                  .filter(category => category.status)
                  .map((category) => (
                    <GenreCard
                      key={category.id}
                      id={category.id}
                      title={category.name}
                      to={`/category/${category.id}`}
                      imageUrl={category.image_url}
                      onClick={incrementCategoryClicks}
                    />
                  ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Featured Books Section */}
          {featuredBooks.length > 0 && (
            <Box width="100%">
              <Heading size="xl" mb={8}>Featured Books</Heading>
              <FeaturedBooksCarousel
                books={featuredBooks}
                bookmarks={bookmarks}
                onBookmarkToggle={handleBookmarkToggle}
              />
            </Box>
          )}

          {/* Exclusive Deals Section */}
          <Box
            width="100%"
            bg={dealsBg}
            borderRadius="2xl"
            p={8}
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align="center"
              justify="space-between"
              gap={6}
            >
              <HStack spacing={6}>
                <Icon as={FiBook} boxSize={8} color="brand.500" />
                <Stack spacing={1}>
                  <Heading size="lg">Exclusive deals</Heading>
                  <Text color="gray.500">
                    Want to access premium summaries and exclusive offers? Join our Book Club now!
                  </Text>
                </Stack>
              </HStack>
              <Button
                size="lg"
                colorScheme="brand"
                as={Link}
                to="/join"
              >
                Join now
              </Button>
            </Flex>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;