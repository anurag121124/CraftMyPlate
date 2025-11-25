import { useQuery } from '@tanstack/react-query';
import { roomActions } from '../actions/roomActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const RoomsPage = () => {
  const { data: rooms, isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomActions.getAllRooms,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading rooms...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Failed to load rooms</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Available Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms?.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription>Room ID: {room.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Base Rate:</span> ₹{room.baseHourlyRate}/hour
                </p>
                <p className="text-sm">
                  <span className="font-medium">Capacity:</span> {room.capacity} people
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoomsPage;

