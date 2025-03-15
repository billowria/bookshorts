import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Select,
  Textarea,
  IconButton,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Divider,
  Flex,
  Tooltip,
  Card,
  CardBody,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Code,
  Tag,
  TagLabel,
  TagLeftIcon,
  Grid,
  GridItem,
  ButtonGroup
} from '@chakra-ui/react';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiBook, 
  FiInfo, 
  FiCode,
  FiImage,
  FiBookOpen,
  FiLayers,
  FiCheck,
  FiX,
  FiEye,
  FiMaximize2,
  FiMinimize2,
  FiFolderPlus,
  FiTrendingUp
} from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import ImageUploader from '../../components/ImageUploader';

const MotionBox = motion(Box);
const MotionPath = motion.path;

// Add this new component for the animated tree
const AnimatedTree = ({ side = 'left', color = '#38B2AC' }) => (
  <Box
    position="absolute"
    top={0}
    bottom={0}
    left={side === 'left' ? 0 : 'auto'}
    right={side === 'right' ? 0 : 'auto'}
    width="120px"
    pointerEvents="none"
    zIndex={0}
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 120 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        top: 0,
        [side]: 0,
        transform: side === 'right' ? 'scaleX(-1)' : 'none'
      }}
    >
      <MotionPath
        d="M40 800 C40 600 80 500 40 400 C0 300 80 200 40 0"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      {[...Array(12)].map((_, i) => (
        <MotionBox
          key={i}
          as="g"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1 + (i * 0.1), duration: 0.5 }}
        >
          <circle
            cx={40 + (Math.sin(i * 0.5) * 20)}
            cy={i * 60 + 50}
            r="4"
            fill={color}
          />
          <MotionPath
            d={`M${40 + (Math.sin(i * 0.5) * 20)} ${i * 60 + 50} C${60 + (Math.sin(i * 0.5) * 20)} ${i * 60 + 30} ${80 + (Math.sin(i * 0.5) * 20)} ${i * 60 + 50} ${100 + (Math.sin(i * 0.5) * 20)} ${i * 60 + 40}`}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.5 + (i * 0.1), duration: 1 }}
          />
        </MotionBox>
      ))}
    </svg>
  </Box>
);

const BookManager = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [newCategory, setNewCategory] = useState({ 
    name: '',
    display_order: 1,
    status: true,
    image_url: ''
  });
  const toast = useToast();
  const { 
    isOpen: isPreviewOpen, 
    onOpen: onPreviewOpen, 
    onClose: onPreviewClose 
  } = useDisclosure();
  const {
    isOpen: isCategoryOpen,
    onOpen: onCategoryOpen,
    onClose: onCategoryClose
  } = useDisclosure();
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    cover_image: '',
    category_id: '',
    display_order: 1,
    status: true,
    core_content: '',
    deep_dive_content: ''
  });

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const codeBg = useColorModeValue('gray.50', 'gray.800');

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      // First fetch the books
      const { data: booksData, error: booksError } = await supabase
        .from('Books')
        .select(`
          *,
          Categories (
            name
          )
        `)
        .order('display_order');

      if (booksError) throw booksError;
      
      // If we have books, fetch their content
      if (booksData && booksData.length > 0) {
        // Get all book IDs
        const bookIds = booksData.map(book => book.id);
        
        // Fetch content for all books
        const { data: contentData, error: contentError } = await supabase
          .from('Content')
          .select('*')
          .in('book_id', bookIds);
          
        if (contentError) throw contentError;
        
        // Add content to books
        const booksWithContent = booksData.map(book => {
          const bookContent = contentData.filter(content => content.book_id === book.id);
          return {
            ...book,
            core_content: bookContent.find(content => content.type === 'core')?.content || '',
            deep_dive_content: bookContent.find(content => content.type === 'deep_dive')?.content || ''
          };
        });
        
        setBooks(booksWithContent);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: 'Error fetching books',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('Categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get the maximum display_order for books
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('Books')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      if (maxOrderError) throw maxOrderError;

      // Calculate the new display_order (either max + 1 or start at 1)
      const newDisplayOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order + 1 
        : 1;

      // Step 1: Insert the book
      const { data: bookData, error: bookError } = await supabase
        .from('Books')
        .insert([{
          title: formData.title,
          cover_image: formData.cover_image,
          category_id: formData.category_id,
          display_order: newDisplayOrder,
          status: true
        }])
        .select()
        .single();

      if (bookError) throw bookError;

      // Step 2: Insert content if provided
      const contentToInsert = [];
      
      if (formData.core_content) {
        contentToInsert.push({
          book_id: bookData.id,
          type: 'core',
          content: formData.core_content
        });
      }
      
      if (formData.deep_dive_content) {
        contentToInsert.push({
          book_id: bookData.id,
          type: 'deep_dive',
          content: formData.deep_dive_content
        });
      }
      
      if (contentToInsert.length > 0) {
        const { error: contentError } = await supabase
          .from('Content')
          .insert(contentToInsert);
          
        if (contentError) throw contentError;
      }

      toast({
        title: 'Book added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setFormData({
        title: '',
        cover_image: '',
        category_id: '',
        display_order: 1,
        status: true,
        core_content: '',
        deep_dive_content: ''
      });

      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: 'Error adding book',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        // First delete associated bookmarks
        const { error: bookmarksError } = await supabase
          .from('Bookmarks')
          .delete()
          .eq('book_id', id);
          
        if (bookmarksError) throw bookmarksError;

        // Then delete associated content
        const { error: contentError } = await supabase
          .from('Content')
          .delete()
          .eq('book_id', id);
          
        if (contentError) throw contentError;
        
        // Finally delete the book
        const { error: bookError } = await supabase
          .from('Books')
          .delete()
          .eq('id', id);

        if (bookError) throw bookError;

        toast({
          title: 'Book deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        toast({
          title: 'Error deleting book',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handlePreview = (book) => {
    setSelectedBook(book);
    onPreviewOpen();
  };

  const handleAddCategory = async (e) => {
    e.preventDefault(); // Prevent form default submission

    try {
      // Validate required fields
      if (!newCategory.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Category name is required',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Set loading state
      setLoading(true);

      console.log('Adding new category:', newCategory); // Debug log

      // Get the maximum display_order
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('Categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      if (maxOrderError) {
        console.error('Error fetching max order:', maxOrderError);
        throw maxOrderError;
      }

      const newDisplayOrder = maxOrderData && maxOrderData.length > 0 
        ? maxOrderData[0].display_order + 1 
        : 1;

      console.log('New display order:', newDisplayOrder); // Debug log

      const { data, error } = await supabase
        .from('Categories')
        .insert([{ 
          name: newCategory.name.trim(),
          display_order: newDisplayOrder,
          status: true,
          image_url: newCategory.image_url || null,
          click_count: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting category:', error);
        throw error;
      }


      toast({
        title: 'Category added',
        description: `${data.name} has been added successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh categories list
      fetchCategories();

      // Reset form
      setNewCategory({ 
        name: '',
        display_order: 1,
        status: true,
        image_url: ''
      });
      
      // Close modal
      onCategoryClose();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error adding category',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCoverImageUpload = async (file) => {
    try {
      if (!file) return;

      // Check authentication status
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw new Error(`Authentication error: ${authError.message}`);
      if (!session?.user) throw new Error('You must be logged in to upload images');
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `books/${fileName}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          metadata: {
            userId: session.user.id
          }
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

      // Update form data with the image URL
      setFormData(prev => ({
        ...prev,
        cover_image: publicUrl
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error uploading image',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCategoryImageUpload = async (file) => {
    try {
      if (!file) return;

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

      // Update category form with the image URL
      setNewCategory(prev => ({
        ...prev,
        image_url: publicUrl
      }));

      toast({
        title: 'Category image uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading category image:', error);
      toast({
        title: 'Error uploading category image',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardBody>
              <VStack spacing={6}>
                <HStack width="full" justify="space-between">
                  <Heading size="lg">
                    <HStack>
                      <FiBookOpen />
                      <Text>Add New Book</Text>
                    </HStack>
                  </Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewMode(!previewMode)}
                    leftIcon={previewMode ? <FiCode /> : <FiEye />}
                  >
                    {previewMode ? 'Show Code' : 'Preview'}
                  </Button>
                </HStack>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                    <GridItem colSpan={{ base: 12, md: 8 }}>
                      <VStack spacing={6} align="stretch">
                        <FormControl isRequired>
                          <FormLabel>
                            <HStack>
                              <FiBook />
                              <Text>Title</Text>
                            </HStack>
                          </FormLabel>
                          <Input
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter book title"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>
                            <HStack>
                              <FiImage />
                              <Text>Cover Image</Text>
                            </HStack>
                          </FormLabel>
                          <ImageUploader
                            onUploadComplete={handleCoverImageUpload}
                            currentImageUrl={formData.cover_image}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>
                            <HStack>
                              <FiLayers />
                              <Text>Category</Text>
                            </HStack>
                          </FormLabel>
                          <HStack>
                            <Select
                              name="category_id"
                              value={formData.category_id}
                              onChange={handleInputChange}
                              placeholder="Select category"
                            >
                              {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </Select>
                            <Tooltip label="Add new category">
                              <IconButton
                                icon={<FiFolderPlus />}
                                aria-label="Add new category"
                                colorScheme="green"
                                onClick={onCategoryOpen}
                              />
                            </Tooltip>
                          </HStack>
                        </FormControl>
                      </VStack>
                    </GridItem>

                    <GridItem colSpan={{ base: 12, md: 4 }} position="relative">
                      <Box position="relative" overflow="visible">
                        <AnimatedTree side="left" color={useColorModeValue('#38B2AC', '#4FD1C5')} />
                        <AnimatedTree side="right" color={useColorModeValue('#38B2AC', '#4FD1C5')} />
                        
                        {formData.cover_image && (
                          <MotionBox
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            position="relative"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                              duration: 0.6
                            }}
                            whileHover={{
                              scale: 1.05,
                              transition: { duration: 0.2 }
                            }}
                            _before={{
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)',
                              zIndex: 1,
                              opacity: 0,
                              transition: '0.3s',
                            }}
                            _hover={{
                              '&:before': {
                                opacity: 1,
                              }
                            }}
                          >
                            <Image
                              src={formData.cover_image}
                              alt="Cover preview"
                              width="full"
                              height="300px"
                              objectFit="cover"
                              fallbackSrc="https://via.placeholder.com/300"
                            />
                            <Tag
                              position="absolute"
                              top={2}
                              right={2}
                              colorScheme="blue"
                              zIndex={2}
                            >
                              <TagLeftIcon as={FiImage} />
                              <TagLabel>Preview</TagLabel>
                            </Tag>
                          </MotionBox>
                        )}
                      </Box>
                    </GridItem>

                    <GridItem colSpan={12}>
                      <Tabs variant="enclosed" colorScheme="blue">
                        <TabList>
                          <Tab>
                            <HStack>
                              <FiCode />
                              <Text>Core Content</Text>
                              {formData.core_content && <FiCheck color="green" />}
                            </HStack>
                          </Tab>
                          <Tab>
                            <HStack>
                              <FiMaximize2 />
                              <Text>Deep Dive Content</Text>
                              {formData.deep_dive_content && <FiCheck color="green" />}
                            </HStack>
                          </Tab>
                        </TabList>
                        <TabPanels>
                          <TabPanel>
                            <VStack spacing={4}>
                              <FormControl isRequired>
                                <HStack justify="space-between" mb={2}>
                                  <FormLabel margin={0}>
                                    <HStack>
                                      <Text>Core HTML Content</Text>
                                      <Tooltip label="Main summary and key points of the book">
                                        <Box><FiInfo /></Box>
                                      </Tooltip>
                                    </HStack>
                                  </FormLabel>
                                </HStack>
                                <Box position="relative">
                                  <Textarea
                                    name="core_content"
                                    value={formData.core_content}
                                    onChange={handleInputChange}
                                    placeholder="Paste your HTML content here"
                                    rows={12}
                                    fontFamily="mono"
                                    bg={codeBg}
                                  />
                                  {previewMode && formData.core_content && (
                                    <Box
                                      mt={4}
                                      p={4}
                                      borderWidth="1px"
                                      borderRadius="md"
                                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.core_content) }}
                                    />
                                  )}
                                </Box>
                              </FormControl>
                            </VStack>
                          </TabPanel>
                          <TabPanel>
                            <VStack spacing={4}>
                              <FormControl isRequired>
                                <HStack justify="space-between" mb={2}>
                                  <FormLabel margin={0}>
                                    <HStack>
                                      <Text>Deep Dive HTML Content</Text>
                                      <Tooltip label="Detailed analysis and extended content">
                                        <Box><FiInfo /></Box>
                                      </Tooltip>
                                    </HStack>
                                  </FormLabel>
                                </HStack>
                                <Box position="relative">
                                  <Textarea
                                    name="deep_dive_content"
                                    value={formData.deep_dive_content}
                                    onChange={handleInputChange}
                                    placeholder="Paste your HTML content here"
                                    rows={12}
                                    fontFamily="mono"
                                    bg={codeBg}
                                  />
                                  {previewMode && formData.deep_dive_content && (
                                    <Box
                                      mt={4}
                                      p={4}
                                      borderWidth="1px"
                                      borderRadius="md"
                                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.deep_dive_content) }}
                                    />
                                  )}
                                </Box>
                              </FormControl>
                            </VStack>
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </GridItem>
                  </Grid>

                  <Divider my={6} />

                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                    leftIcon={<FiPlus />}
                    width="full"
                    size="lg"
                  >
                    Add Book
                  </Button>
                </form>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="lg">
                  <HStack>
                    <FiBook />
                    <Text>Books List</Text>
                  </HStack>
                </Heading>

                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Book</Th>
                      <Th>Category</Th>
                      <Th>Status</Th>
                      <Th>Content Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {books.map(book => (
                      <Tr key={book.id} _hover={{ bg: hoverBg }}>
                        <Td>
                          <HStack spacing={4}>
                            <Image
                              src={book.cover_image || 'https://via.placeholder.com/50'}
                              alt={book.title}
                              boxSize="50px"
                              objectFit="cover"
                              borderRadius="md"
                            />
                            <Text fontWeight="medium">{book.title}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Tag colorScheme="blue" size="md">
                            <TagLeftIcon as={FiLayers} />
                            <TagLabel>{book.Categories?.name}</TagLabel>
                          </Tag>
                        </Td>
                        <Td>
                          <Tag colorScheme={book.status ? "green" : "red"} size="sm">
                            <TagLeftIcon as={book.status ? FiCheck : FiX} />
                            <TagLabel>{book.status ? "Active" : "Inactive"}</TagLabel>
                          </Tag>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Tag colorScheme={book.core_content ? "green" : "red"} size="sm">
                              <TagLeftIcon as={book.core_content ? FiCheck : FiX} />
                              <TagLabel>Core</TagLabel>
                            </Tag>
                            <Tag colorScheme={book.deep_dive_content ? "green" : "red"} size="sm">
                              <TagLeftIcon as={book.deep_dive_content ? FiCheck : FiX} />
                              <TagLabel>Deep Dive</TagLabel>
                            </Tag>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<FiEye />}
                              aria-label="Preview book"
                              size="sm"
                              colorScheme="green"
                              onClick={() => handlePreview(book)}
                            />
                            <IconButton
                              icon={<FiEdit2 />}
                              aria-label="Edit book"
                              size="sm"
                              colorScheme="blue"
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              aria-label="Delete book"
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDelete(book.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>
      </VStack>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiBookOpen />
              <Text>{selectedBook?.title}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {selectedBook?.cover_image && (
                <Image 
                  src={selectedBook.cover_image}
                  alt={selectedBook.title}
                  maxH="300px"
                  objectFit="contain"
                  borderRadius="md"
                  mx="auto"
                />
              )}
              <Box>
                <Heading size="sm" mb={2}>Category</Heading>
                <Tag colorScheme="blue">
                  <TagLeftIcon as={FiLayers} />
                  <TagLabel>{selectedBook?.Categories?.name}</TagLabel>
                </Tag>
              </Box>
              <Tabs>
                <TabList>
                  <Tab>Core Content</Tab>
                  <Tab>Deep Dive</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {selectedBook?.core_content ? (
                      <Box 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md"
                        dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(selectedBook.core_content) 
                        }} 
                      />
                    ) : (
                      <Text color="gray.500">No core content available</Text>
                    )}
                  </TabPanel>
                  <TabPanel>
                    {selectedBook?.deep_dive_content ? (
                      <Box 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md"
                        dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(selectedBook.deep_dive_content) 
                        }} 
                      />
                    ) : (
                      <Text color="gray.500">No deep dive content available</Text>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add Category Modal */}
      <Modal isOpen={isCategoryOpen} onClose={onCategoryClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiFolderPlus />
              <Text>Add New Category</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleAddCategory}>
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Category Name</FormLabel>
                  <Input
                    placeholder="Enter category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Category Image</FormLabel>
                  <ImageUploader
                    onUploadComplete={handleCategoryImageUpload}
                    currentImageUrl={newCategory.image_url}
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <ButtonGroup spacing={3}>
                <Button colorScheme="blue" type="submit" leftIcon={<FiPlus />}>
                  Add Category
                </Button>
                <Button onClick={onCategoryClose}>Cancel</Button>
              </ButtonGroup>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default BookManager; 