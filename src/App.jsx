import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';
import adminTheme from './theme/adminTheme';
import userTheme from './theme/userTheme';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useScrollToTop } from './hooks/useScrollToTop';

// User pages
import Home from './pages/Home';
import BookPage from './pages/Book';
import BookDetails from './pages/BookDetails';
import CategoryBooks from './pages/CategoryBooks';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import AllBooks from './pages/AllBooks';

// Admin pages
import BookManager from './pages/Admin/BookManager';
import ContentManager from './pages/Admin/ContentManager';
import Analytics from './pages/Admin/Analytics';
import NoMatch from './pages/Admin/NoMatch';
import Dashboard from './pages/Admin/Dashboard';
// Components
import Navbar from './components/Navbar';
  
// Create a ScrollToTop component
function ScrollToTop() {
  useScrollToTop();
  return null;
}

const App = () => {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  return (
    <ChakraProvider theme={isAdminRoute ? adminTheme : userTheme}>
      <ScrollToTop />
      <Box minH="100vh">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/books" element={<AllBooks />} />

          {/* User Routes */}
          <Route >
            <Route path="/" element={<Home />} />
            <Route path="book/:bookId" element={<BookPage />} />
            <Route path="book/:bookId/details" element={<BookDetails />} />
            <Route path="category/:categoryId" element={<CategoryBooks />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="admin" element={<Dashboard />} />
            <Route path="admin/books" element={<BookManager />} />
            <Route path="admin/content" element={<ContentManager />} />
            <Route path="admin/analytics" element={<Analytics />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <ProtectedRoute requireAdmin={true}>
                <BookManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute requireAdmin={true}>
                <ContentManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Error Handling */}
          <Route path="/404" element={<NoMatch />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Box>
    </ChakraProvider>
  );
};

export default App;