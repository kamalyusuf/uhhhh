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

interface Props {
  oncancel: () => void;
}

export const CreateRoomForm = ({ oncancel }: Props) => {
  const { socket } = useSocket();
  const router = useRouter();
  const [creating, setcreating] = useState(false);
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      private: false,
      require_password: false,
      password: ""
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? "name must be at least 2 characters" : null,

      password: (value, values) =>
        values.require_password && value && value.length < 5
          ? "password must be at least 5 characters"
          : null
    }
  });

  const onsubmit = form.onSubmit(async (values) => {
    setcreating(true);

    try {
      if (!socket) return toast.error("webserver is down");

      if (!(await micenabled())) return;

      const { room } = await request({
        socket,
        event: "create room",
        payload: {
          name: values.name,
          description: values.description.trim(),
          visibility: values.private
            ? RoomVisibility.PRIVATE
            : RoomVisibility.PUBLIC,
          password:
            values.require_password && values.password
              ? values.password
              : undefined
        }
      });

      oncancel();
      router.push(`/rooms/${room._id}`);
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
