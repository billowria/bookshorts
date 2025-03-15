import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Avatar,
  HStack,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  useColorModeValue,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiBook, FiBookmark, FiStar } from 'react-icons/fi';
import { supabase } from '../../services/supabase';
import { getUserBookmarks } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import BookCard from '../../components/BookCard';

const UserProfile = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [bookmarksError, setBookmarksError] = useState(null);
  const { user, signOut, loading: authLoading } = useAuth();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        console.log('Fetching bookmarks for user:', user.id);
        setBookmarksLoading(true);
        setBookmarksError(null);
        
        // Fetch bookmarks with detailed book information
        const { data, error } = await supabase
          .from('Bookmarks')
          .select(`
            id,
            created_at,
            Books (
              id,
              title,
              cover_image,
              avg_rating,
              category_id,
              Categories (
                name
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('Bookmarks fetched:', data);
        setBookmarks(data || []);
      } catch (error) {
        console.error('Error fetching user bookmarks:', error);
        setBookmarksError(error.message);
        toast({
          title: 'Error',
          description: `Failed to load your bookmarks: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setBookmarksLoading(false);
      }
    };

    if (user?.id && !authLoading) {
      fetchUserData();
    }
  }, [user?.id, authLoading, toast]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="center" minH="60vh" justify="center">
          <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
          <Text color="gray.500" fontSize="lg">Loading your profile...</Text>
        </VStack>
      </Container>
    );
  }

  // Show error if no user is found (shouldn't happen due to ProtectedRoute)
  if (!user) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          User session not found. Please try logging in again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* User Info Section */}
        <Box
          bg={bgColor}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          p={8}
          shadow="lg"
        >
          <VStack spacing={6}>
            <Avatar
              size="2xl"
              name={user.email || 'User'}
              src={user.user_metadata?.avatar_url}
            />
            <VStack spacing={2}>
              <Heading size="lg">{user.email || 'User'}</Heading>
              <Badge colorScheme="brand">Member</Badge>
            </VStack>

            <StatGroup width="100%">
              <Stat textAlign="center">
                <StatLabel>Bookmarks</StatLabel>
                <StatNumber>{bookmarks.length}</StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel>Books Read</StatLabel>
                <StatNumber>0</StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel>Reviews</StatLabel>
                <StatNumber>0</StatNumber>
              </Stat>
            </StatGroup>

            <Button colorScheme="red" variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </VStack>
        </Box>

        <Divider />

        {/* Bookmarked Books Section */}
        {bookmarksLoading ? (
          <VStack spacing={4} py={8}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.500">Loading your bookmarks...</Text>
          </VStack>
        ) : bookmarksError ? (
          <Alert status="error" borderRadius="md" my={4}>
            <AlertIcon />
            {bookmarksError}
          </Alert>
        ) : bookmarks.length > 0 ? (
          <>
            <Heading size="lg">
              <HStack>
                <FiBookmark />
                <Text>Your Bookmarks</Text>
              </HStack>
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {bookmarks.map((bookmark) => (
                <BookCard
                  key={bookmark.id}
                  book={bookmark.Books}
                  isBookmarked={true}
                />
              ))}
            </SimpleGrid>
          </>
        ) : (
          <VStack spacing={4} py={8}>
            <FiBook size={40} />
            <Text color="gray.500">
              You haven't bookmarked any books yet. Start exploring!
            </Text>
            <Button
              as="a"
              href="/"
              colorScheme="brand"
              leftIcon={<FiBook />}
            >
              Explore Books
            </Button>
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default UserProfile; 