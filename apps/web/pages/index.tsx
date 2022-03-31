import React, { useState } from "react";
import {
  Button,
  Group,
  Paper,
  TextInput,
  Box,
  Center,
  Checkbox
} from "@mantine/core";
import { useMeStore } from "../store/me";
import { toast } from "react-toastify";
import { Layout } from "../components/Layout";
import { PageComponent } from "../types";
import splitbee from "@splitbee/web";

const HomePage: PageComponent = () => {
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(false);
  const { load } = useMeStore();

  return (
    <>
      <Layout spacing={50} title="uhhhh">
        <Box>
          <Center>
            <Paper p={"xl"} shadow={"sm"} radius="md" style={{ width: 350 }}>
              <Group direction="column" grow>
                <TextInput
                  placeholder="display name"
                  label="display name"
                  required
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                />
                <Checkbox
                  label="remember me"
                  size="xs"
                  checked={remember}
                  onChange={(e) => setRemember(e.currentTarget.checked)}
                />
                <Button
                  onClick={() => {
                    if (!name.trim()) {
                      return toast.warn("where yo name at?");
                    }
                    if (name.trim().length < 3) {
                      return toast.warn("name should be at least 3 characters");
                    }

                    splitbee.track("login", { name });

                    load(name, remember);
                  }}
                >
                  submit
                </Button>
              </Group>
            </Paper>
          </Center>
        </Box>
      </Layout>
    </>
  );
};

HomePage.authenticate = "not";

export default HomePage;
