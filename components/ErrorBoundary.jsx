import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>😟</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#991B1B', marginBottom: 8, textAlign: 'center' }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: '#7F1D1D', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
            An unexpected error occurred. Tap below to try again.
          </Text>
          <TouchableOpacity 
            onPress={this.handleRetry}
            style={{
              backgroundColor: '#EF4444',
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 50,
              borderBottomWidth: 4,
              borderBottomColor: '#B91C1C',
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 2 }}>TAP TO RETRY</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
