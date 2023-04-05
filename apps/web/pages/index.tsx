import { useState } from "react";
import {
  Button,
  Paper,
  TextInput,
  Box,
  Center,
  Checkbox,
  Stack
} from "@mantine/core";
import { useUserStore } from "../store/user";
import { toast } from "react-toastify";
import { Layout } from "../components/_layout";
import type { PageComponent } from "../types";

const HomePage: PageComponent = () => {
  const [name, setname] = useState("");
  const [remember, setremember] = useState(false);
  const load = useUserStore((state) => state.load);

  return (
    <>
      <Layout spacing={50} title="uhhhh">
        <Box>
          <Center>
            <Paper p={"xl"} shadow={"sm"} radius="md" style={{ width: 350 }}>
              <Stack>
                <TextInput
                  placeholder="display name"
                  label="display name"
                  required
                  value={name}
                  onChange={(event) => setname(event.currentTarget.value)}
                />
                <Checkbox
                  label="remember me"
                  size="xs"
                  checked={remember}
                  onChange={(e) => setremember(e.currentTarget.checked)}
                />
                <Button
                  onClick={() => {
                    if (!name.trim()) return toast.warn("where yo name at?");

                    if (name.trim().length < 3)
                      return toast.warn("name should be at least 3 characters");

                    load(name, remember);
                  }}
                >
                  submit
                </Button>
              </Stack>
            </Paper>
          </Center>
        </Box>
      </Layout>
    </>
  );
};

HomePage.authenticate = "not";

export default HomePage;
