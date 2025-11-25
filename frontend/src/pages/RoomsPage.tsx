import { useQuery } from '@tanstack/react-query';
import { roomActions } from '../actions/roomActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Users, Clock, Sparkles, AlertCircle } from 'lucide-react';

const RoomsPage = () => {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomActions.getAllRooms,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load rooms</AlertTitle>
        <AlertDescription>Please try again later</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Available Workspaces</h1>
          <p className="text-muted-foreground mt-2">Choose the perfect space for your needs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rooms?.map((room) => (
          <Card key={room.id} className="group hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base">{room.name}</CardTitle>
                  <CardDescription className="text-xs font-mono">ID: {room.id.slice(0, 8)}...</CardDescription>
                </div>
                <Badge variant="success" className="bg-green-500 text-white border-green-600 text-xs shrink-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">₹{room.baseHourlyRate}</span>
                  <span className="text-xs text-muted-foreground">/hour</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{room.capacity} {room.capacity === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Flexible</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground text-lg">No rooms available at the moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoomsPage;

