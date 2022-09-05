import {
  Button,
  Group,
  TextInput,
  Text,
  Checkbox,
  Stack,
  PasswordInput
} from "@mantine/core";
import { Field, FieldProps, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useSocket } from "../../hooks/use-socket";
import { request } from "../../utils/request";
import { RoomVisibility } from "types";
import { analytics } from "../../lib/analytics";
import { toast } from "react-toastify";

interface Props {
  onCancel: () => void;
}

export const CreateRoomForm = ({ onCancel }: Props) => {
  const { socket } = useSocket();
  const router = useRouter();

  return (
    <Formik
      initialValues={{
        name: "",
        description: "",
        private: false,
        require_password: false,
        password: ""
      }}
      onSubmit={async (values) => {
        if (!socket) return toast.error("webserver is down");

        const { room } = await request({
          socket,
          event: "create room",
          payload: {
            name: values.name,
            description: values.description,
            visibility: values.private
              ? RoomVisibility.PRIVATE
              : RoomVisibility.PUBLIC,
            password:
              values.require_password && values.password
                ? values.password
                : undefined
          }
        });

        analytics.track("create room", {
          ...room,
          room_creator_name: room.creator.display_name,
          creator: undefined
        });

        onCancel();
        router.push(`/rooms/${room._id}`);
      }}
    >
      {({ isSubmitting, values }) => (
        <Form>
          <Text size="xs" color="yellow" style={{ fontStyle: "italic" }}>
            note: rooms are automatically deleted upon leaving
          </Text>
          <Stack>
            <Field name="name">
              {({ field }: FieldProps) => (
                <TextInput
                  label="name"
                  placeholder="name"
                  required
                  {...field}
                  data-autofocus
                  autoComplete="off"
                />
              )}
            </Field>

            <Field name="description">
              {({ field }: FieldProps) => (
                <TextInput
                  label="description"
                  placeholder="description"
                  required
                  {...field}
                  autoComplete="off"
                />
              )}
            </Field>

            <Field name="private" type="checkbox">
              {({ field }: FieldProps) => (
                <Checkbox label="private" size="sm" {...field} />
              )}
            </Field>

            <Field name="require_password" type="checkbox">
              {({ field }: FieldProps) => (
                <Checkbox label="require password" size="sm" {...field} />
              )}
            </Field>

            {values.require_password && (
              <Field name="password">
                {({ field }: FieldProps) => (
                  <PasswordInput
                    label="password"
                    placeholder="password"
                    {...field}
                  />
                )}
              </Field>
            )}
            <Group position="right" grow style={{ marginTop: 10 }}>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={
                  isSubmitting ||
                  !values.name.trim() ||
                  !values.description.trim()
                }
              >
                create
              </Button>
              <Button variant="default" onClick={onCancel}>
                cancel
              </Button>
            </Group>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
