import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NoMatch = () => {
  return (
    <Box textAlign="center" py={20} px={6}>
      <Heading size="2xl" mb={2}>404</Heading>
      <Text fontSize="xl" mb={4}>Page Not Found</Text>
      <Button as={RouterLink} to="/" colorScheme="blue">
        Return Home
      </Button>
    </Box>
  );
};

export default NoMatch;