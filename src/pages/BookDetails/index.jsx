import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Icon,
  Button,
  useColorModeValue,
  keyframes,
} from '@chakra-ui/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowLeft, FiStar } from 'react-icons/fi';
import { supabase } from '../../services/supabase';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// Define animations
const scrollLineAnimation = keyframes`
  0% { transform: translateY(0); background-position: 0 0; }
  100% { transform: translateY(-100%); background-position: 0 100%; }
`;

const BookDetails = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
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

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data, error } = await supabase
          .from('Books')
          .select(`
            *,
            Categories (
              name,
              image_url
            )
          `)
          .eq('id', bookId)
          .single();

        if (error) throw error;
        setBook(data);
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  // Dummy book summary for the story section
  const bookSummary = "This captivating book takes readers on an unforgettable journey through themes of discovery, challenge, and transformation. The narrative weaves together complex characters and thought-provoking situations that reflect the human experience in profound ways. Readers will find themselves immersed in a world that feels both familiar and extraordinary, with each page revealing new insights and unexpected turns. The author's masterful storytelling creates a rich tapestry of emotions and ideas that will stay with you long after you've finished the final chapter.";

  return (
    <Box
      ref={containerRef}
      minH="300vh"
      bg="black"
      color="white"
      position="relative"
    >
      {/* Animated Line */}
      <Box
        position="fixed"
        left="5%"
        top="0"
        width="2px"
        height="200%"
        bgGradient="linear(to-b, transparent, purple.500, blue.500, transparent)"
        animation={`${scrollLineAnimation} 2s linear infinite`}
        zIndex={1}
      />

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
          src={book?.Categories?.image_url || book?.cover_image}
          alt={book?.title}
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
            {book?.title}
          </MotionHeading>
        </Box>
      </MotionBox>

      {/* Story Section */}
      <MotionContainer
        maxW="container.md"
        position="relative"
        minH="100vh"
        pt="100vh"
        style={{
          opacity: contentOpacity,
          y: contentY
        }}
      >
        <VStack spacing={8} align="start" p={8}>
          <MotionHeading size="2xl" mb={6}>The Story</MotionHeading>
          <MotionText fontSize="xl" lineHeight="tall">
            {bookSummary}
          </MotionText>
        </VStack>
      </MotionContainer>

      {/* Details Section */}
      <MotionContainer
        maxW="container.lg"
        position="relative"
        minH="100vh"
        style={{
          opacity: detailsOpacity,
          scale: detailsScale
        }}
      >
        <VStack spacing={12} align="center" p={8}>
          <Heading size="2xl">Book Details</Heading>
          <HStack spacing={12} wrap="wrap" justify="center">
            <Box
              bg="whiteAlpha.100"
              p={8}
              borderRadius="xl"
              backdropFilter="blur(10px)"
              maxW="300px"
            >
              <Image
                src={book?.cover_image}
                alt={book?.title}
                borderRadius="lg"
                boxShadow="dark-lg"
                mb={4}
              />
              <VStack spacing={4} align="start">
                <Heading size="md">{book?.title}</Heading>
                <HStack>
                  <Icon as={FiStar} color="yellow.400" />
                  <Text>{book?.avg_rating ? `${book.avg_rating.toFixed(1)}/5` : 'Not rated'}</Text>
                </HStack>
              </VStack>
            </Box>
          </HStack>
        </VStack>
      </MotionContainer>

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

export default BookDetails; 