import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';

const Analytics = () => {
  // Mock analytics data
  const stats = [
    { label: 'Total Users', value: 1254, change: 12.5, increase: true },
    { label: 'Active Readers', value: 876, change: 8.2, increase: true },
    { label: 'Books Viewed', value: 3421, change: 23.1, increase: true },
    { label: 'Avg. Time Spent', value: '5m 32s', change: 2.4, increase: false },
  ];

  return (
    <Container maxW="container.xl">
      <Box p={6} borderWidth="1px" borderRadius="lg" bg="white">
        <Heading as="h1" size="xl" mb={4}>Analytics Dashboard</Heading>
        <Text mb={6}>Overview of user engagement and content performance.</Text>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {stats.map((stat, index) => (
            <Box key={index} p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Stat>
                <StatLabel fontSize="md">{stat.label}</StatLabel>
                <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                <StatHelpText>
                  <StatArrow type={stat.increase ? 'increase' : 'decrease'} />
                  {stat.change}%
                </StatHelpText>
              </Stat>
            </Box>
          ))}
        </SimpleGrid>
        
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <Heading as="h3" size="md" mb={4}>Future Implementation</Heading>
          <Text>
            This section will include detailed charts and metrics for content performance,
            user engagement patterns, and conversion analytics.
          </Text>
        </Box>
      </Box>
    </Container>
  );
};

export default Analytics; 