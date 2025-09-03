import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export function ChatTest() {
  const { messages, addMessage, clearChat, isInitialized, sessionId } = useChatStore();
  const { session } = useAuthStore();

  const addTestMessage = () => {
    const testMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: `Test message ${Date.now()}`,
      timestamp: new Date(),
    };
    addMessage(testMessage);
  };

  const addBotResponse = () => {
    const botMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot' as const,
      content: `Bot response ${Date.now()}`,
      timestamp: new Date(),
    };
    addMessage(botMessage);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Chat Persistence Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={addTestMessage} variant="outline">
            Add Test Message
          </Button>
          <Button onClick={addBotResponse} variant="outline">
            Add Bot Response
          </Button>
          <Button onClick={clearChat} variant="destructive">
            Clear Chat
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="secondary"
          >
            Reload Page
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <strong>Status:</strong> {isInitialized ? '✅ Initialized' : '⏳ Loading...'}
          </div>
          <div className="text-sm text-gray-600">
            <strong>Session ID:</strong> {sessionId || 'None'}
          </div>
          <div className="text-sm text-gray-600">
            <strong>User ID:</strong> {session?.user?.user_id || 'None'}
          </div>
          <div className="text-sm text-gray-600">
            <strong>Message Count:</strong> {messages.length}
          </div>
        </div>

        <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
          <h4 className="font-semibold mb-2">Messages:</h4>
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded ${
                    message.type === 'user' 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-xs text-gray-600 mb-1">
                    {message.type} - {message.timestamp instanceof Date 
                      ? message.timestamp.toLocaleTimeString() 
                      : new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  <div>{message.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>Test Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Add some test messages using the buttons above</li>
            <li>Navigate to another page and come back</li>
            <li>Reload the page</li>
            <li>Verify that your messages persist</li>
            <li>Sign out and sign back in to test fresh chat</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
