import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ChangePasswordPage from "./pages/public/ChangePasswordPage";
import PackagesPage from "./pages/public/PackagesPage";
import PackageDetailPage from "./pages/public/PackageDetailPage";
import CheckoutPage from "./pages/public/CheckoutPage";
import PaymentSuccessPage from "./pages/public/PaymentSuccessPage";
import DashboardPage from "./pages/subscriber/DashboardPage";
import QuestionDetailPage from "./pages/subscriber/QuestionDetailPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import BookmarksPage from "./pages/subscriber/BookmarksPage";
import SubscriptionPage from "./pages/subscriber/SubscriptionPage";
import EmployeeDashboard from "./pages/portal/EmployeeDashboard";
import SubmitQuestionPage from "./pages/portal/SubmitQuestionPage";
import TutorReviewPage from "./pages/portal/TutorReviewPage";
import AdminPanelPage from "./pages/portal/AdminPanelPage";
import ProfilePage from "./pages/common/ProfilePage";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="bottom-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* We will add more routes here as we build each page */}

            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route path="/packages" element={<PackagesPage />} />

            <Route path="/packages/:id" element={<PackageDetailPage />} />

            <Route path="/checkout/:id" element={<CheckoutPage />} />

            <Route
              path="/payment/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/questions"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              element={<RoleRoute allowedRoles={["SUBSCRIBER", "ADMIN"]} />}
            />
            <Route
              path="/dashboard/questions/:id"
              element={
                <ProtectedRoute>
                  <QuestionDetailPage />
                </ProtectedRoute>
              }
            />

            {/* <Route
                path="/forgot-password"
                element={
                  <PublicOnlyRoute>
                    <ForgotPasswordPage />
                  </PublicOnlyRoute>
                }
              /> */}

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route
              path="/reset-password"
              element={
                <PublicOnlyRoute>
                  <ResetPasswordPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/dashboard/bookmarks"
              element={
                <ProtectedRoute>
                  <BookmarksPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/subscription"
              element={
                <ProtectedRoute>
                  <SubscriptionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage isPortal={false} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/dashboard"
              element={
                <RoleRoute allowedRoles={["EMPLOYEE", "TUTOR", "ADMIN"]}>
                  <EmployeeDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/portal/submit"
              element={
                <RoleRoute allowedRoles={["EMPLOYEE", "TUTOR", "ADMIN"]}>
                  <SubmitQuestionPage />
                </RoleRoute>
              }
            />

            <Route
              path="/portal/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage isPortal={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/review"
              element={
                <RoleRoute allowedRoles={["TUTOR", "ADMIN"]}>
                  <TutorReviewPage />
                </RoleRoute>
              }
            />
            <Route
              path="/portal/admin"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["ADMIN"]}>
                    <AdminPanelPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/portal/admin/review"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["ADMIN"]}>
                    <AdminPanelPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/portal/packages"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["ADMIN"]}>
                    <AdminPanelPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/portal/audit"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["ADMIN"]}>
                    <AdminPanelPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/portal/access"
              element={
                <ProtectedRoute>
                  <RoleRoute allowedRoles={["ADMIN", "TUTOR"]}>
                    <AdminPanelPage />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
