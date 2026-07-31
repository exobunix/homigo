import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Title } from 'react-native-paper';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log('Error caught by boundary:', error);
    console.log('Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={styles.container}>
          <Card style={styles.errorCard}>
            <Card.Content>
              <Title style={styles.errorTitle}>🚨 Something went wrong!</Title>
              <Text style={styles.errorText}>
                Error: {this.state.error && this.state.error.toString()}
              </Text>
              <Text style={styles.errorDetails}>
                {this.state.errorInfo?.componentStack}
              </Text>
              <Button 
                mode="contained" 
                onPress={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                style={styles.retryButton}
              >
                Try Again
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  errorTitle: {
    color: '#dc2626',
    marginBottom: 10,
  },
  errorText: {
    color: '#991b1b',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  errorDetails: {
    color: '#7f1d1d',
    fontSize: 12,
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: '#dc2626',
  },
});

export default ErrorBoundary;
