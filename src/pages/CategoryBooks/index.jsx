// src/pages/CategoryBooks/index.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Heading, 
  SimpleGrid, 
  Spinner, 
  Alert, 
  AlertIcon,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Badge,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Icon,
  Fade,
  ScaleFade,
  useBreakpointValue,
  Tooltip,
  Divider,
  useDisclosure,
  Collapse,
  useToast,
  InputRightElement,
  IconButton,
  AspectRatio,
  Image,
  Grid,
  Skeleton,
  Flex
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase';
import { toggleBookmark } from '../../services/supabase';
import BookCard from '../../components/BookCard';
import { FiSearch, FiBook, FiFilter, FiX, FiChevronDown, FiChevronUp, FiHome, FiBookmark, FiStar } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);
const MotionGrid = motion(Grid);
const MotionFlex = motion(Flex);

// Add animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const BookItem = ({ book, isBookmarked, onBookmarkToggle, categoryName }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <MotionBox
      as="article"
      position="relative"
      borderRadius="xl"
      overflow="hidden"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      _hover={{ transform: 'translateY(-8px)', shadow: 'xl' }}
      role="group"
      maxW="100%"
      h="280px"
    >
      <Box position="relative" h="full">
        <Image
          src={book.cover_image || "/images/book-placeholder.jpg"}
          alt={book.title}
          w="100%"
          h="100%"
          objectFit="cover"
          transition="transform 0.3s ease"
          _groupHover={{ transform: 'scale(1.05)' }}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85))"
        />
        
        {/* Book Info Overlay */}
        <VStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={4}
          align="start"
          spacing={2}
        >
          <Text
            color="white"
            fontSize="lg"
            fontWeight="bold"
            noOfLines={2}
            textShadow="0 2px 4px rgba(0,0,0,0.3)"
            mb={0}
          >
            {book.title}
          </Text>
          
          <HStack spacing={2} justify="space-between" w="full">
            <HStack spacing={2}>
              {book.avg_rating && (
                <Badge
                  colorScheme="yellow"
                  display="flex"
                  alignItems="center"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  fontSize="xs"
                >
                  <FiStar style={{ marginRight: '4px' }} />
                  {book.avg_rating.toFixed(1)}
                </Badge>
              )}
              <Badge
                colorScheme="blue"
                px={2}
                py={0.5}
                borderRadius="full"
                fontSize="xs"
              >
                {categoryName}
              </Badge>
            </HStack>
            
            <Button
              as={Link}
              to={`/book/${book.id}/details`}
              size="sm"
              colorScheme="purple"
              variant="solid"
              opacity={0}
              transform="translateY(10px)"
              _groupHover={{
                opacity: 1,
                transform: "translateY(0)",
              }}
              transition="all 0.2s"
            >
              About Book
            </Button>
          </HStack>
        </VStack>

        {/* Bookmark Button */}
        <Tooltip
          label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
          placement="top"
        >
          <IconButton
            icon={<FiBookmark />}
            position="absolute"
            top={2}
            right={2}
            rounded="full"
            size="sm"
            aria-label="Bookmark"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle(book.id);
            }}
            bg={isBookmarked ? 'blue.500' : 'whiteAlpha.900'}
            color={isBookmarked ? 'white' : 'gray.600'}
            _hover={{
              transform: 'scale(1.1)',
              bg: isBookmarked ? 'blue.600' : 'white',
            }}
            boxShadow="lg"
          />
        </Tooltip>
      </Box>
    </MotionBox>
  );
};

const CategoryBooks = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState(new Set());
  const { user } = useAuth();
  const toast = useToast();
  
  // Scroll to top when component mounts
 
  
  // Color mode values
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50)',
    'linear(to-br, gray.800, gray.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('blue.500', 'blue.300');


  // Responsive values
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching category data for ID:', categoryId);
        
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('Categories')
          .select('*')
          .eq('id', categoryId)
          .single();
        
        if (categoryError) throw categoryError;
        
        // Fetch books for this category with complete information
        const { data: booksData, error: booksError } = await supabase
          .from('Books')
          .select(`
            id, 
            title, 
            cover_image, 
            display_order, 
            status,
            avg_rating,
            category_id,
            Categories (
              id,
              name
            )
          `)
          .eq('category_id', categoryId)
          .eq('status', true)
          .order('display_order', { ascending: true });
        
        if (booksError) throw booksError;
        
        console.log('Category data:', categoryData);
        console.log('Books data:', booksData);
        
        setCategory(categoryData);
        setBooks(booksData || []);
        setFilteredBooks(booksData || []);
        
        // Fetch user bookmarks if logged in
        if (user?.id) {
          const { data: bookmarksData, error: bookmarksError } = await supabase
            .from('Bookmarks')
            .select('book_id')
            .eq('user_id', user.id);
            
          if (bookmarksError) {
            console.error('Error fetching bookmarks:', bookmarksError);
          } else if (bookmarksData) {
            const bookmarkIds = new Set(bookmarksData.map(b => b.book_id));
            setBookmarks(bookmarkIds);
          }
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError(err.message || 'Failed to load category data');
        toast({
          title: 'Error',
          description: `Failed to load category data: ${err.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId, user?.id, toast]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  const handleBookmarkToggle = async (bookId) => {
    try {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to bookmark books',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Use the toggleBookmark helper function instead of RPC
      const { data, error } = await toggleBookmark(bookId, user.id);
      
      if (error) throw error;

      // Update local bookmarks state
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
        description: err.message || 'Failed to update bookmark',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" minH="100vh" alignItems="center" bgGradient={bgGradient}>
        <VStack spacing={4}>
          <Spinner 
            size="xl" 
            thickness="4px" 
            color={highlightColor}
            emptyColor="gray.200"
            speed="0.65s"
          />
          <Text color={textColor} fontSize="lg">Loading books...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8} bgGradient={bgGradient} minH="100vh">
        <ScaleFade initialScale={0.9} in={true}>
          <Alert 
            status="error" 
            variant="left-accent" 
            borderRadius="xl" 
            my={6}
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            p={8}
            bg={cardBg}
            shadow="xl"
          >
            <AlertIcon boxSize="32px" mr={0} mb={4} />
            <Text fontSize="xl" mb={4} fontWeight="medium">
              Error loading books: {error}
            </Text>
            <Button 
              as={Link} 
              to="/" 
              colorScheme="blue" 
              size="lg"
              leftIcon={<FiBook />}
            >
              Return to Home
            </Button>
          </Alert>
        </ScaleFade>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <MotionFlex
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={4}
        >
          <Heading size="2xl" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
            {category?.name}
          </Heading>
          
          <HStack spacing={4} flex={{ base: '1', md: 'initial' }}>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="full"
              />
            </InputGroup>
            <IconButton
              icon={<FiFilter />}
              aria-label="Filter books"
              rounded="full"
              variant="ghost"
            />
          </HStack>
        </MotionFlex>

        {loading ? (
          <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} height="280px" borderRadius="xl" />
            ))}
          </Grid>
        ) : (
          <MotionGrid
            templateColumns={`repeat(${gridColumns}, 1fr)`}
            gap={4}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {filteredBooks.map((book) => (
              <BookItem
                key={book.id}
                book={book}
                isBookmarked={bookmarks.has(book.id)}
                onBookmarkToggle={handleBookmarkToggle}
                categoryName={category?.name}
              />
            ))}
          </MotionGrid>
        )}
      </VStack>
    </Container>
  );
};

export default CategoryBooks;