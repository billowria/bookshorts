import React, { forwardRef, memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Badge,
  Link,
  IconButton,
  useColorModeValue,
  useToken,
  Image,
  Tooltip,
  Skeleton,
  useBreakpointValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiBookmark, FiStar, FiEye } from 'react-icons/fi';

const MotionBox = motion(Box);

const BookThumbnail = ({ src, title }) => {
  const [loaded, setLoaded] = React.useState(false);
  const fallbackBg = useColorModeValue('gray.100', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      position="relative"
      width="100%"
      pt="133.33%" // 3:4 aspect ratio
      overflow="hidden"
      borderRadius="12px"
      border="1px solid"
      borderColor={borderColor}
      bg={fallbackBg}
    >
      <Skeleton
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        isLoaded={loaded}
        fadeDuration={0.4}
      >
        <Image
          src={src}
          alt={title}
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          objectFit="cover"
          onLoad={() => setLoaded(true)}
          fallbackStrategy="beforeLoad"
        />
      </Skeleton>
    </Box>
  );
};

const RatingBadge = ({ rating }) => {
  const [highlight, muted] = useToken('colors', ['yellow.400', 'gray.500']);
  const value = rating ? parseFloat(rating).toFixed(1) : 'N/A';
  
  return (
    <Flex
      align="center"
      gap={1}
      px={2}
      py={1}
      borderRadius="md"
      bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
    >
      <FiStar color={highlight} />
      <Text fontSize="xs" fontWeight="600" color={muted}>
        {value}
      </Text>
    </Flex>
  );
};

const BookInfo = ({ title, author, views }) => {
  const titleColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const metaColor = useColorModeValue('gray.600', 'gray.400');
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex direction="column" gap={1} flex={1}>
      <Text
        fontSize={isMobile ? 'sm' : 'md'}
        fontWeight="600"
        noOfLines={2}
        lineHeight="tight"
        color={titleColor}
      >
        {title}
      </Text>
      
      <Flex gap={3} align="center">
        {author && (
          <Text
            fontSize="xs"
            color={metaColor}
            noOfLines={1}
            title={author}
          >
            {author}
          </Text>
        )}
        
        <Flex align="center" gap={1} color={metaColor}>
          <FiEye size="14px" />
          <Text fontSize="xs">{views?.toLocaleString() || 0}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

const BookCard = memo(forwardRef(({
  book,
  isBookmarked,
  onBookmarkToggle,
  showCategory,
  ...props
}, ref) => {
  const [highlight, danger] = useToken('colors', ['brand.500', 'red.500']);
  const cardBg = useColorModeValue('white', 'gray.800');
  const shadowColor = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(0,0,0,0.2)');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const {
    id,
    title,
    cover_image,
    author,
    avg_rating,
    click_count,
    category
  } = book;

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmarkToggle?.();
  };

  return (
    <MotionBox
      ref={ref}
      position="relative"
      bg={cardBg}
      borderRadius="lg"
      p={2}
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 12px ${shadowColor}`
      }}
      transition="all 0.2s cubic-bezier(.17,.67,.83,.67)"
      {...props}
    >
      <Link
        as={RouterLink}
        to={`/book/${id}`}
        _hover={{ textDecoration: 'none' }}
        display="block"
      >
        <Flex gap={3} align="start">
          {/* Thumbnail Column */}
          <Box flexShrink={0} width={isMobile ? '80px' : '100px'}>
            <BookThumbnail src={cover_image} title={title} />
          </Box>

          {/* Info Column */}
          <Flex direction="column" gap={2} flex={1} minWidth={0}>
            {showCategory && category?.name && (
              <Badge
                alignSelf="start"
                variant="subtle"
                colorScheme="blue"
                fontSize="2xs"
                px={2}
                borderRadius="sm"
              >
                {category.name}
              </Badge>
            )}
            
            <BookInfo
              title={title}
              author={author}
              views={click_count}
            />
            
            <Flex gap={2} align="center">
              <RatingBadge rating={avg_rating} />
              
              {onBookmarkToggle && (
                <Tooltip
                  label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  hasArrow
                  placement="top"
                >
                  <IconButton
                    icon={<FiBookmark />}
                    aria-label="Bookmark"
                    size="xs"
                    variant="ghost"
                    color={isBookmarked ? danger : highlight}
                    onClick={handleBookmark}
                    _hover={{
                      bg: useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
                    }}
                  />
                </Tooltip>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Link>

      {/* Progress Indicator (Optional) */}
      {/* <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height="2px"
        bg="brand.100"
        _after={{
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '60%',
          bg: 'brand.500',
          borderRadius: 'full'
        }}
      /> */}
    </MotionBox>
  );
}));

export default BookCard;