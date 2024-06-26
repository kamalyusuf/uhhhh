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
import { Layout } from "../components/layout";
import type { PageComponent } from "../types";
import { username } from "../utils/username";

const HomePage: PageComponent = () => {
  const [name, setname] = useState(username());
  const [remember, setremember] = useState(false);
  const load = useUserStore((state) => state.load);

  return (
    <>
      <Layout gap={50} title="uhhhh">
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
                    const n = name.trim();

                    if (!n) return toast.error("where yo name at?");

                    if (n.length < 3)
                      return toast.error(
                        "name should be at least 3 characters"
                      );

                    if (!/^[a-z0-9]+$/i.test(n))
                      return toast.error("no special characters allowed");

                    load(n, remember);
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
