import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Badge,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Circle,
  Tooltip,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiBook, FiClock, FiTrendingUp, FiUsers } from 'react-icons/fi';

const MotionBox = motion(Box);

const CategoryCard = ({ category }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const iconColor = useColorModeValue('brand.500', 'brand.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Mock data for the category stats
  const stats = [
    { icon: FiBook, value: '12', label: 'Books' },
    { icon: FiUsers, value: '1.2k', label: 'Readers' },
    { icon: FiClock, value: '2h', label: 'Avg. Time' },
  ];

  const cardVariants = {
    initial: { y: 0 },
    hover: {
      y: -5,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  };

  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    hover: {
      rotate: 360,
      scale: 1.2,
      transition: {
        duration: 0.5,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <RouterLink to={`/category/${category.id}`}>
      <MotionBox
        position="relative"
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        overflow="hidden"
        bg={bgColor}
        boxShadow="lg"
        _hover={{ boxShadow: '2xl' }}
        variants={cardVariants}
        whileHover="hover"
        initial="initial"
      >
        <VStack spacing={6} p={6}>
          {/* Category Icon */}
          <MotionBox variants={iconVariants}>
            <Circle
              size="60px"
              bg={useColorModeValue('brand.50', 'brand.900')}
              color={iconColor}
            >
              <Icon as={FiTrendingUp} w={6} h={6} />
            </Circle>
          </MotionBox>

          {/* Category Header */}
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" fontWeight="bold">
              {category.name}
            </Heading>
            <Badge
              colorScheme="brand"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              {category.type || 'General'}
            </Badge>
          </VStack>

          {/* Category Description */}
          <Text color={textColor} noOfLines={2} textAlign="center">
            {category.description || 'Explore a curated collection of book summaries in this category.'}
          </Text>

          {/* Stats Section */}
          <HStack spacing={8} justify="center">
            {stats.map((stat, index) => (
              <Tooltip key={index} label={stat.label} hasArrow>
                <VStack spacing={1}>
                  <Icon as={stat.icon} w={5} h={5} color={iconColor} />
                  <Text fontWeight="bold" fontSize="sm">
                    {stat.value}
                  </Text>
                </VStack>
              </Tooltip>
            ))}
          </HStack>

          {/* Trending Indicator */}
          {category.trending && (
            <Badge
              position="absolute"
              top={4}
              right={4}
              colorScheme="accent"
              variant="solid"
              borderRadius="full"
              px={3}
              py={1}
            >
              Trending
            </Badge>
          )}
        </VStack>
      </MotionBox>
    </RouterLink>
  );
};

export default CategoryCard;
