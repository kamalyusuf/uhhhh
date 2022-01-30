import { Button, Group, TextInput } from "@mantine/core";
import { Field, FieldProps, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useSocket } from "../../hooks/useSocket";
import { request } from "../../lib/request";

interface Props {
  onCancel: () => void;
}

export const CreateRoomForm = ({ onCancel }: Props) => {
  const { socket } = useSocket();
  const router = useRouter();

  return (
    <Formik
      initialValues={{ name: "", description: "" }}
      onSubmit={async ({ name, description }) => {
        const { room } = await request({
          socket,
          event: "create room",
          data: { name, description }
        });

        onCancel();
        router.push(`/rooms/${room._id}`);
      }}
    >
      {({ isSubmitting, values }) => (
        <Form>
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
