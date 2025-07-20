import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to monitoring service
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
          <div className="bg-dark-800/50 rounded-2xl p-8 max-w-md w-full text-center border border-red-500/20">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              حدث خطأ غير متوقع
            </h2>
            <p className="text-gray-400 mb-4">
              نعتذر، واجه التطبيق مشكلة أثناء التشغيل. الرجاء المحاولة مرة أخرى.
            </p>

            {/* عرض مزيد من التفاصيل المفهومة للمستخدم */}
            {this.state.error && (
              <div className="bg-dark-900 text-left text-red-400 text-sm p-4 rounded mb-4">
                <strong className="block text-red-500 mb-1">
                  تفاصيل الخطأ:
                </strong>
                <p className="mb-2">الرسالة: {this.state.error.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <p>
                    حدث الخطأ في أحد المكونات التالية:
                    <pre className="whitespace-pre-wrap text-xs mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </p>
                )}
              </div>
            )}

            <button
              onClick={this.handleRetry}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center mx-auto"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
