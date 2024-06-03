import {
  Button,
  Group,
  TextInput,
  Text,
  Checkbox,
  Stack,
  PasswordInput
} from "@mantine/core";
import { useRouter } from "next/router";
import { useSocket } from "../socket/socket-provider";
import { request } from "../../utils/request";
import { RoomVisibility } from "types";
import { toast } from "react-toastify";
import { micenabled } from "../../utils/mic";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { useSettingsStore } from "../../store/settings";

interface Props {
  oncancel: () => void;
}

export const CreateRoomForm = ({ oncancel }: Props) => {
  const { socket } = useSocket();
  const router = useRouter();
  const [creating, setcreating] = useState(false);
  const autojoin = useSettingsStore((state) => state.auto_join_room);
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      private: false,
      require_password: false,
      password: ""
    }
  });

  const onsubmit = form.onSubmit(async (values) => {
    if (!socket) return toast.error("web server is down");

    if (!(await micenabled())) return;

    setcreating(true);

    try {
      const { room } = await request({
        socket,
        event: "create room",
        payload: {
          name: values.name,
          description: values.description,
          password: (values.require_password && values.password) || undefined,
          visibility: values.private
            ? RoomVisibility.PRIVATE
            : RoomVisibility.PUBLIC
        }
      });

      oncancel();

      router[autojoin ? "push" : "prefetch"](`/rooms/${room._id}`);
    } catch (e) {
      setcreating(false);
    }
  });

  return (
    <form onSubmit={onsubmit}>
      <Text size="xs" c="yellow" style={{ fontStyle: "italic" }}>
        note: rooms are automatically deleted upon leaving
      </Text>

      <Stack>
        <TextInput
          label="name"
          placeholder="name"
          required
          data-autofocus
          autoComplete="off"
          {...form.getInputProps("name")}
        />

        <TextInput
          label="description"
          placeholder="description"
          autoComplete="off"
          {...form.getInputProps("description")}
        />

        <Checkbox
          label="private"
          size="sm"
          {...form.getInputProps("private", { type: "checkbox" })}
        />

        <Checkbox
          label="password"
          size="sm"
          {...form.getInputProps("require_password", { type: "checkbox" })}
        />

        {form.values.require_password && (
          <PasswordInput
            placeholder="password"
            {...form.getInputProps("password")}
          />
        )}

        <Group justify="right" grow style={{ marginTop: 10 }}>
          <Button
            type="submit"
            loading={creating}
            disabled={creating || !form.values.name.trim()}
          >
            create
          </Button>
          <Button variant="default" onClick={oncancel}>
            cancel
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
