import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  useToast,
  VStack,
  HStack,
  Select,
  Text,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider
} from '@chakra-ui/react';
import { supabase } from '../services/supabase';

// Quill editor modules configuration
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'indent',
  'link', 'image', 'video',
  'direction',
  'align',
  'color', 'background',
  'code-block',
  'blockquote',
  'script'
];

/**
 * ContentEditor component for editing book content with HTML support
 * @param {Object} props
 * @param {string} props.bookId - ID of the book to edit
 */
const ContentEditor = ({ bookId }) => {
  const [book, setBook] = useState(null);
  const [contentType, setContentType] = useState('core');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Fetch book data and content
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch book details
        const { data: bookData, error: bookError } = await supabase
          .from('Books')
          .select('*')
          .eq('id', bookId)
          .single();
          
        if (bookError) throw bookError;
        if (!bookData) throw new Error('Book not found');
        
        setBook(bookData);
        
        // Fetch content for the selected type
        await fetchContent(contentType);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error fetching data',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (bookId) {
      fetchData();
    }
  }, [bookId, toast]);
  
  // Fetch content when content type changes
  useEffect(() => {
    if (bookId && !loading) {
      fetchContent(contentType);
    }
  }, [contentType]);
  
  // Function to fetch content based on type
  const fetchContent = async (type) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('Content')
        .select('*')
        .eq('book_id', bookId)
        .eq('type', type)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error;
      }
      
      if (data) {
        setContent(data.content || '');
        setOriginalContent(data.content || '');
      } else {
        // No content found, set empty
        setContent('');
        setOriginalContent('');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: 'Error fetching content',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle content change
  const handleContentChange = (value) => {
    setContent(value);
  };
  
  // Handle content type change
  const handleTypeChange = (e) => {
    setContentType(e.target.value);
  };
  
  // Save content to database
  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from('Content')
        .upsert({
          book_id: bookId,
          type: contentType,
          content: content,
          is_html: true,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'book_id,type'
        });
      
      if (error) throw error;
      
      setOriginalContent(content);
      
      toast({
        title: 'Content saved',
        description: 'The content has been saved successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error saving content',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Discard changes
  const handleDiscard = () => {
    setContent(originalContent);
    toast({
      title: 'Changes discarded',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Check if content has been modified
  const hasChanges = content !== originalContent;
  
  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">
          {loading ? 'Loading...' : `Edit Content: ${book?.title || 'Unknown Book'}`}
        </Heading>
        
        <FormControl>
          <FormLabel>Content Type</FormLabel>
          <Select 
            value={contentType} 
            onChange={handleTypeChange}
            isDisabled={loading || saving}
          >
            <option value="core">Core Concepts</option>
            <option value="deep_dive">Deep Dive</option>
          </Select>
        </FormControl>
        
        <Tabs isFitted variant="enclosed" onChange={(index) => setPreview(index === 1)}>
          <TabList mb="1em">
            <Tab>Editor</Tab>
            <Tab>Preview</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <Box 
                borderWidth="1px" 
                borderRadius="lg" 
                borderColor={borderColor}
                overflow="hidden"
                bg={bgColor}
              >
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  style={{ 
                    height: '500px',
                    backgroundColor: useColorModeValue('white', 'gray.700')
                  }}
                />
              </Box>
            </TabPanel>
            <TabPanel p={0}>
              <Box 
                borderWidth="1px" 
                borderRadius="lg" 
                borderColor={borderColor}
                overflow="auto"
                bg={bgColor}
                p={4}
                height="500px"
                className="html-content"
                sx={{
                  // Custom styling for HTML content
                  'h1, h2, h3, h4, h5, h6': {
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                    mt: 4,
                    mb: 2
                  },
                  h1: { fontSize: '2xl', mt: 6, mb: 4 },
                  h2: { fontSize: 'xl', mt: 5, mb: 3 },
                  h3: { fontSize: 'lg' },
                  p: { mb: 4, lineHeight: 1.7 },
                  ul: { pl: 6, mb: 4 },
                  ol: { pl: 6, mb: 4 },
                  li: { mb: 2 },
                  a: { color: 'blue.500', textDecoration: 'underline' },
                  blockquote: {
                    borderLeftWidth: '4px',
                    borderLeftColor: 'gray.300',
                    pl: 4,
                    py: 1,
                    my: 4,
                    fontStyle: 'italic'
                  },
                  img: {
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: 'md',
                    my: 4
                  },
                  table: {
                    width: '100%',
                    borderCollapse: 'collapse',
                    my: 4
                  },
                  'th, td': {
                    borderWidth: '1px',
                    borderColor: 'gray.200',
                    p: 2
                  },
                  th: {
                    bg: 'gray.50',
                    fontWeight: 'bold'
                  },
                  pre: {
                    bg: 'gray.50',
                    p: 4,
                    borderRadius: 'md',
                    overflowX: 'auto',
                    my: 4
                  },
                  code: {
                    fontFamily: 'monospace',
                    bg: 'gray.100',
                    p: 1,
                    borderRadius: 'sm'
                  }
                }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Divider />
        
        <HStack spacing={4} justify="flex-end">
          {hasChanges && (
            <Text color="orange.500" fontWeight="medium">
              You have unsaved changes
            </Text>
          )}
          <Button 
            colorScheme="gray" 
            onClick={handleDiscard} 
            isDisabled={!hasChanges || saving}
          >
            Discard Changes
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSave} 
            isLoading={saving}
            isDisabled={!hasChanges || loading}
            loadingText="Saving"
          >
            Save Changes
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ContentEditor; 