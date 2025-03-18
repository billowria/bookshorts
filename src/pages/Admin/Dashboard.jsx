import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  useColorModeValue,
  VStack,
  HStack,
  Divider,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Flex,
  Badge,
  Tooltip,
  Progress
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiBook,
  FiUsers,
  FiTrendingUp,
  FiEdit3,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiBookOpen
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';

// Wrap Chakra components with motion
const MotionBox = motion(Box);
const MotionSimpleGrid = motion(SimpleGrid);
const MotionCard = motion(Card);

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCategories: 0,
    recentViews: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const statBg = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total books
        const { data: books, error: booksError } = await supabase
          .from('Books')
          .select('id', { count: 'exact' });

        // Fetch total categories
        const { data: categories, error: categoriesError } = await supabase
          .from('Categories')
          .select('id', { count: 'exact' });

        if (booksError) throw booksError;
        if (categoriesError) throw categoriesError;

        // Simulate some stats for demo
        setStats({
          totalBooks: books?.length || 0,
          totalCategories: categories?.length || 0,
          recentViews: Math.floor(Math.random() * 1000),
          completionRate: Math.floor(Math.random() * 100)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      title: 'Books',
      icon: FiBookOpen,
      path: '/admin/books',
      color: 'teal',
      description: 'Add and manage books'
    },
    {
      title: 'Content Manager',
      icon: FiEdit3,
      path: '/admin/content',
      color: 'blue',
      description: 'Manage book content and chapters'
    },
    {
      title: 'Approval Manager',
      icon: FiBook,
      path: '/admin/approvals',
      color: 'orange',
      description: 'Manage content approval requests'
    },
    {
      title: 'Analytics',
      icon: FiBarChart2,
      path: '/admin/analytics',
      color: 'green',
      description: 'View detailed analytics and reports'
    },
    {
      title: 'Categories',
      icon: FiBook,
      path: '/admin/categories',
      color: 'purple',
      description: 'Manage book categories'
    },
    {
      title: 'Settings',
      icon: FiSettings,
      path: '/admin/settings',
      color: 'gray',
      description: 'Configure application settings'
    }
  ];

  return (
    <Container maxW="container.xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          mb={8}
          p={6}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <HStack spacing={4}>
            <Avatar
              size="lg"
              name={user?.email}
              src={user?.user_metadata?.avatar_url}
              bg="blue.500"
            />
            <VStack align="start" spacing={1}>
              <Heading size="lg">Welcome Back!</Heading>
              <Text color={textColor}>{user?.email}</Text>
              <Badge colorScheme="green">Admin</Badge>
            </VStack>
          </HStack>
          <Button
            leftIcon={<FiLogOut />}
            onClick={handleSignOut}
            colorScheme="red"
            variant="outline"
            mt={{ base: 4, md: 0 }}
          >
            Sign Out
          </Button>
        </Flex>

        {/* Stats Grid */}
        <MotionSimpleGrid
          columns={{ base: 1, md: 2, lg: 4 }}
          spacing={6}
          mb={8}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            label="Total Books"
            value={stats.totalBooks}
            icon={FiBookOpen}
            increase={12}
            bg={statBg}
          />
          <StatCard
            label="Categories"
            value={stats.totalCategories}
            icon={FiBook}
            increase={5}
            bg={statBg}
          />
          <StatCard
            label="Recent Views"
            value={stats.recentViews}
            icon={FiUsers}
            increase={22}
            bg={statBg}
          />
          <StatCard
            label="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={FiTrendingUp}
            increase={8}
            bg={statBg}
          >
            <Progress
              value={stats.completionRate}
              size="sm"
              colorScheme="green"
              mt={2}
            />
          </StatCard>
        </MotionSimpleGrid>

        {/* Menu Grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {menuItems.map((item, index) => (
            <MotionCard
              key={item.title}
              as={Link}
              to={item.path}
              bg={bgColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              overflow="hidden"
              cursor="pointer"
              _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.2,
                delay: 0.1 * (index + 1),
                ease: "easeOut"
              }}
            >
              <CardBody>
                <HStack spacing={4}>
                  <Flex
                    p={3}
                    bg={`${item.color}.100`}
                    color={`${item.color}.500`}
                    borderRadius="lg"
                    align="center"
                    justify="center"
                  >
                    <Icon as={item.icon} boxSize={6} />
                  </Flex>
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{item.title}</Heading>
                    <Text color={textColor} fontSize="sm">
                      {item.description}
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>
      </MotionBox>
    </Container>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon: IconComponent, increase, bg, children }) => (
  <MotionCard
    p={6}
    bg={bg}
    borderRadius="lg"
    initial={{ scale: 0.95 }}
    animate={{ scale: 1 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Stat>
      <HStack spacing={4} mb={2}>
        <Flex
          p={2}
          bg="blue.500"
          color="white"
          borderRadius="lg"
          align="center"
          justify="center"
        >
          <Icon as={IconComponent} boxSize={6} />
        </Flex>
        <StatLabel fontSize="lg" fontWeight="medium">
          {label}
        </StatLabel>
      </HStack>
      <StatNumber fontSize="3xl" fontWeight="bold">
        {value}
      </StatNumber>
      <StatHelpText>
        <StatArrow type="increase" />
        {increase}% since last month
      </StatHelpText>
      {children}
    </Stat>
  </MotionCard>
);

export default Dashboard; 