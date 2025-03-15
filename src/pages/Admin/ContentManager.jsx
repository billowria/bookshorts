import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Image,
  Stack,
  Divider,
  Badge,
  useColorModeValue,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { supabase } from '../../services/supabase';
import ContentEditor from '../../components/ContentEditor';

const ContentManager = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Fetch books and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('Categories')
          .select('*')
          .order('display_order', { ascending: true });
          
        if (categoriesError) throw categoriesError;
        
        // Fetch books with their categories
        const { data: booksData, error: booksError } = await supabase
          .from('Books')
          .select(`
            *,
            category:Categories (
              id,
              name
            )
          `)
          .order('display_order', { ascending: true });
          
        if (booksError) throw booksError;
        
        setCategories(categoriesData);
        setBooks(booksData);
        setFilteredBooks(booksData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter books when search query or category filter changes
  useEffect(() => {
    if (books.length > 0) {
      let filtered = [...books];
      
      // Apply category filter
      if (categoryFilter) {
        filtered = filtered.filter(book => 
          book.category && book.category.id === categoryFilter
        );
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(book => 
          book.title.toLowerCase().includes(query)
        );
      }
      
      setFilteredBooks(filtered);
    }
  }, [searchQuery, categoryFilter, books]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle category filter change
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };
  
  // Open editor modal for a book
  const handleEditContent = (book) => {
    setSelectedBook(book);
    onOpen();
  };
  
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Content Manager</Heading>
      <Text mb={6} color="gray.500">
        Manage book content and edit HTML content for each book.
      </Text>
      
      {/* Filters */}
      <HStack mb={6} spacing={4}>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search books..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </InputGroup>
        
        <Select
          placeholder="All Categories"
          value={categoryFilter}
          onChange={handleCategoryChange}
          maxW="250px"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </HStack>
      
      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          No books found matching your criteria.
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredBooks.map(book => (
            <Card key={book.id} bg={cardBg} borderColor={borderColor} borderWidth="1px" overflow="hidden">
              <CardHeader pb={0}>
                <Flex justify="space-between" align="flex-start">
                  <Heading size="md" noOfLines={2}>
                    {book.title}
                  </Heading>
                  {book.category && (
                    <Badge colorScheme="blue" ml={2}>
                      {book.category.name}
                    </Badge>
                  )}
                </Flex>
              </CardHeader>
              
              <CardBody>
                <Flex direction={{ base: 'column', sm: 'row' }} align="center" gap={4}>
                  <Image
                    src={book.cover_image || 'https://via.placeholder.com/150x225?text=No+Cover'}
                    alt={book.title}
                    borderRadius="md"
                    objectFit="cover"
                    maxW={{ base: '100%', sm: '100px' }}
                    height={{ base: 'auto', sm: '150px' }}
                  />
                  <Stack flex={1}>
                    <Text noOfLines={3} fontSize="sm" color="gray.500">
                      {book.description || 'No description available.'}
                    </Text>
                  </Stack>
                </Flex>
              </CardBody>
              
              <Divider />
              
              <CardFooter>
                <Button
                  colorScheme="blue"
                  width="full"
                  onClick={() => handleEditContent(book)}
                >
                  Edit Content
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}
      
      {/* Content Editor Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent maxW="90vw">
          <ModalHeader>
            Edit Content
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody pb={6}>
            {selectedBook && (
              <ContentEditor bookId={selectedBook.id} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ContentManager;