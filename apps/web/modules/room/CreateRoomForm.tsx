import { Button, Group, TextInput, Text, Checkbox } from "@mantine/core";
import { Field, FieldProps, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useSocket } from "../../hooks/useSocket";
import { request } from "../../lib/request";
import { RoomVisibility } from "types";

interface Props {
  onCancel: () => void;
}

export const CreateRoomForm = ({ onCancel }: Props) => {
  const { socket } = useSocket();
  const router = useRouter();

  return (
    <Formik
      initialValues={{ name: "", description: "", checked: false }}
      onSubmit={async ({ name, description, checked }) => {
        const { room } = await request({
          socket,
          event: "create room",
          data: {
            name,
            description,
            visibility: checked ? RoomVisibility.PRIVATE : RoomVisibility.PUBLIC
          }
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
          <Group direction="column" grow>
            <Field name="name">
              {({ field }: FieldProps) => (
                <TextInput
                  label="name"
                  placeholder="room name"
                  required
                  {...field}
                  data-autofocus
                />
              )}
            </Field>

            <Field name="description">
              {({ field }: FieldProps) => (
                <TextInput
                  label="description"
                  placeholder="room description"
                  required
                  {...field}
                />
              )}
            </Field>

            <Field name="checked" type="checkbox">
              {({ field }: FieldProps) => (
                <Checkbox label="private" size="sm" {...field} />
              )}
            </Field>
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
          </Group>
        </Form>
      )}
    </Formik>
  );
};
