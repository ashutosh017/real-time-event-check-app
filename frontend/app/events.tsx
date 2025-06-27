import { graphqlClient } from "@/lib/gqlClient";
import {
  GET_ALL_EVENTS,
  GET_ME,
  JOIN_EVENT,
  LEAVE_EVENT,
} from "@/lib/mutations";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { useEffect, useRef, useState } from "react";
import { Button, Text, View } from "react-native";
import { io, Socket } from "socket.io-client";

type Event = {
  id: string;
  name: string;
  location: string;
  startTime: any;
  attendees: {
    id: string;
    name: string;
  }[];
};

type EventsResponse = {
  events: Event[];
};

interface Me {
  id: string;
  name: string;
  email: string;
}

type GetMeResponseType = {
  me: Me;
};

type userEventsResponseType = {
  eventId: string;
  userId: string;
  userName: string;
};

const token = `Bearer eyJhbGciOiJIUzI1NiJ9.Y21jZDE5MTQyMDAwNWp4ajVmZmhmdTFxOA.kX0jKTybdl1ApXH-PmAWgbC0oGsoHyEBdUMmlIJYxHI`;

export default function EventsScreen() {
  const socket = useRef<Socket | null>(null);
  const queryClient = new QueryClient();
  const [me, setMe] = useState<Me | null>(null);

  const meData = useQuery<GetMeResponseType>({
    queryKey: ["me"],
    queryFn: async () => {
      return await graphqlClient.request(GET_ME, undefined, {
        Authorization: token,
      });
    },
  });
  const initialEventsData = useQuery<EventsResponse>({
    queryKey: ["events"],
    queryFn: async () => {
      return await graphqlClient.request(GET_ALL_EVENTS, undefined, {
        Authorization: token,
      });
    },
  });

  useEffect(() => {
    socket.current = io("http://localhost:3000", {
      transports: ["websocket"],
    });
    socket.current.emit("register", token);

    console.log("me data: ", meData.data?.me?.id);
  }, []);
  useEffect(() => {
    setMe(meData.data?.me ?? null);
  }, [meData]);

  useEffect(() => {
    if (!initialEventsData.isSuccess) return;
    console.log(
      "🧠 All cached queries:",
      queryClient
        .getQueryCache()
        .findAll()
        .map((q) => q.queryKey)
    );
    console.log("queryclient useEffect ran");
    const handleUserJoinedEvent = (data: userEventsResponseType) => {
      console.log("handle user join event recieved");
      queryClient.setQueryData<EventsResponse>(["events"], () => {
        const oldData = initialEventsData.data;
        const updatedEvents = (oldData?.events ?? []).map((event) =>
          event.id === data.eventId
            ? {
                ...event,
                attendees: [
                  ...event.attendees,
                  { id: data.userId, name: data.userName },
                ],
              }
            : event
        );
        console.log("updated Events(join): ", updatedEvents);
        return {
          events: updatedEvents,
        };
      });
    };

    const handleUserLeftEvent = (data: userEventsResponseType) => {
      console.log("handle user left event recieved");

      queryClient.setQueryData<EventsResponse>(["events"], () => {
        const oldData = initialEventsData.data;
        const updatedEvents = (oldData?.events ?? []).map((event: Event) =>
          event.id === data.eventId
            ? {
                ...event,
                attendees: event.attendees.filter(
                  (attendee: { id: string; name: string }) =>
                    attendee.id !== data.userId
                ),
              }
            : event
        );

        console.log("updated Events: ", updatedEvents);
        return {
          events: updatedEvents,
        };
      });
    };

    socket.current?.on("userJoinedEvent", handleUserJoinedEvent);
    socket.current?.on("userLeftEvent", handleUserLeftEvent);
    return () => {
      socket.current?.off("userJoinedEvent", handleUserJoinedEvent);
      socket.current?.off("userLeftEvent", handleUserLeftEvent);
    };
  }, [queryClient, initialEventsData.isSuccess]);

  const joinEventMutation = useMutation({
    mutationFn: async ({ eventId }: { eventId: string }) => {
      const res = await request(
        "http://localhost:4000",
        JOIN_EVENT,
        {
          eventId,
        },
        {
          Authorization: token,
        }
      );
      return res;
    },
  });
  const leaveEventMutation = useMutation({
    mutationFn: async ({ eventId }: { eventId: string }) => {
      const res = await request(
        "http://localhost:4000",
        LEAVE_EVENT,
        {
          eventId,
        },
        {
          Authorization: token,
        }
      );
      return res;
    },
  });

  const handleJoin = async (eventId: string) => {
    if (!socket.current) {
      console.log("no socket ");
    }
    const joinEventRes = await joinEventMutation.mutateAsync({ eventId });
    console.log("join event res: ", joinEventRes);
    if (joinEventRes && initialEventsData.isSuccess) {
      console.log("join event emitted");
      socket.current?.emit("joinEvent", { eventId, id: me?.id });
    }
  };
  const handleLeaveEvent = async (eventId: string) => {
    const leaveEventRes = await leaveEventMutation.mutateAsync({ eventId });
    console.log("join event res: ", leaveEventRes);
    if (leaveEventRes && initialEventsData.isSuccess) {
      socket.current?.emit("leaveRoom", { eventId, id: me?.id });
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {initialEventsData.data?.events.map((event, i) => (
        <View
          key={i}
          style={{
            marginBottom: 10,
            borderColor: "black",
            borderWidth: 1,
            padding: 8,
            display: "flex",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 25 }}>{event.name}</Text>
          <View style={{ marginLeft: 4 }}>
            <Text style={{ fontSize: 18 }}>Attendees:</Text>
            {event.attendees.map((attendee, j) => (
              <Text style={{ marginLeft: 2 }} key={j}>
                {attendee.name} {me?.id === attendee.id && "(you)"}
              </Text>
            ))}
          </View>
          {event.attendees.find((attendee) => attendee.id === me?.id) ? (
            <Button
              onPress={() => handleLeaveEvent(event.id)}
              title="Leave event"
              color={"red"}
            ></Button>
          ) : (
            <Button
              onPress={() => {
                handleJoin(event.id);
              }}
              title="Join"
            ></Button>
          )}
        </View>
      ))}
    </View>
  );
}
