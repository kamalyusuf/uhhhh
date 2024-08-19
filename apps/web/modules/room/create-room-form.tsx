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
import { toast } from "react-toastify";
import { micenabled } from "../../utils/mic";
import { useState } from "react";
import { useSettingsStore } from "../../store/settings";
import { useUpdateSocketQuery } from "../../hooks/use-update-socket-query";

interface Props {
  oncancel: () => void;
}

export const CreateRoomForm = ({ oncancel }: Props) => {
  const { socket } = useSocket();
  const router = useRouter();
  const [creating, setcreating] = useState(false);
  const autojoin = useSettingsStore((state) => state.auto_join_room);
  const update = useUpdateSocketQuery();
  const [form, setform] = useState({
    name: "",
    description: "",
    private: false,
    require_password: false,
    password: ""
  });

  const onchange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setform((prev) => ({
      ...prev,
      [event.target.name]: ["private", "require_password"].includes(
        event.target.name
      )
        ? event.target.checked
        : event.target.value
    }));
  };

  const onsubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!socket) return toast.error("web server is down");

    setcreating(true);

    try {
      if (!(await micenabled())) return;

      const { room } = await request({
        socket,
        event: "create room",
        payload: {
          name: form.name,
          description: form.description,
          password: (form.require_password && form.password) || undefined,
          visibility: form.private ? "private" : "public"
        }
      });

      oncancel();

      update("rooms", (draft) => {
        draft.rooms.unshift(room);
      });

      await router[
        autojoin || room.visibility === "private" ? "push" : "prefetch"
      ](`/rooms/${room._id}`);
    } catch (e) {
    } finally {
      setcreating(false);
    }
  };

  return (
    <form onSubmit={onsubmit}>
      <Text size="xs" c="yellow" style={{ fontStyle: "italic" }}>
        note: rooms are automatically deleted upon leaving
      </Text>

      <Stack>
        <TextInput
          name="name"
          label="name"
          placeholder="name"
          required
          data-autofocus
          autoComplete="off"
          onChange={onchange}
        />

        <TextInput
          name="description"
          label="description"
          placeholder="description"
          autoComplete="off"
          onChange={onchange}
        />

        <Checkbox
          name="private"
          label="private"
          size="sm"
          onChange={onchange}
        />

        <Checkbox
          name="require_password"
          label="password"
          size="sm"
          onChange={onchange}
        />

        {form.require_password && (
          <PasswordInput
            name="password"
            placeholder="password"
            onChange={onchange}
          />
        )}

        <Group justify="right" grow style={{ marginTop: 10 }}>
          <Button
            type="submit"
            loading={creating}
            disabled={creating || !form.name.trim()}
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
