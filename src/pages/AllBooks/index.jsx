import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  IconButton,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Grid,
  Tooltip,
  useBreakpointValue,
  Flex,
  Skeleton,
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiBookmark, FiStar, FiSearch, FiFilter, FiBook } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);
const MotionFlex = motion(Flex);

const BookItem = ({ book, isBookmarked, onBookmarkToggle }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <MotionBox
      as="article"
      position="relative"
      borderRadius="2xl"
      overflow="hidden"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      _hover={{ transform: 'translateY(-8px)', shadow: 'xl' }}
      role="group"
    >
      <RouterLink to={`/book/${book.id}`}>
        <Box position="relative">
          <Image
            src={book.cover_image || "/images/book-placeholder.jpg"}
            alt={book.title}
            w="100%"
            h="300px"
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
            bg="linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8))"
          />
          
          {/* Book Info Overlay */}
          <VStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            p={6}
            align="start"
            spacing={2}
          >
            <Text
              color="white"
              fontSize="xl"
              fontWeight="bold"
              noOfLines={2}
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
            >
              {book.title}
            </Text>
            
            <HStack spacing={4}>
              <Badge
                colorScheme="yellow"
                display="flex"
                alignItems="center"
                px={2}
                py={1}
                borderRadius="full"
              >
                <FiStar style={{ marginRight: '4px' }} />
                {book.avg_rating?.toFixed(1) || 'N/A'}
              </Badge>
              {book.category && (
                <Badge
                  colorScheme="blue"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {book.category}
                </Badge>
              )}
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
              top={4}
              right={4}
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
      </RouterLink>
    </MotionBox>
  );
};

const AllBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState(new Set());
  const { user } = useAuth();
  
  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });

  useEffect(() => {
    fetchBooks();
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('Books')
        .select('*, Categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('Bookmarks')
        .select('book_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarks(new Set(data.map(bookmark => bookmark.book_id)));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleBookmarkToggle = async (bookId) => {
    if (!user) return;

    try {
      const isBookmarked = bookmarks.has(bookId);
      if (isBookmarked) {
        await supabase
          .from('Bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('book_id', bookId);
        bookmarks.delete(bookId);
      } else {
        await supabase
          .from('Bookmarks')
          .insert([{ user_id: user.id, book_id: bookId }]);
        bookmarks.add(bookId);
      }
      setBookmarks(new Set(bookmarks));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <MotionFlex
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          justify="center"
          align="center"
          direction="column"
          w="full"
          mb={6}
        >
          <HStack spacing={3} mb={4}>
            <Icon as={FiBook} boxSize={8} color="blue.400" />
            <Heading 
              size="2xl" 
              bgGradient="linear(to-r, blue.400, purple.500)" 
              bgClip="text"
              fontFamily="'Dancing Script', cursive"
              textAlign="center"
            >
              Explore Books
            </Heading>
          </HStack>
          
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
          <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={6}>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} height="300px" borderRadius="2xl" />
            ))}
          </Grid>
        ) : (
          <MotionGrid
            templateColumns={`repeat(${columns}, 1fr)`}
            gap={6}
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
              />
            ))}
          </MotionGrid>
        )}
      </VStack>
    </Container>
  );
};

export default AllBooks; 