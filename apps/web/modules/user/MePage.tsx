import {
  Box,
  Center,
  Paper,
  TextInput,
  Checkbox,
  Button,
  Group
} from "@mantine/core";
import { Layout } from "../../components/Layout";
import { PageComponent } from "../../types";
import { toast } from "react-toastify";
import React, { useState, useEffect } from "react";
import { useMeStore } from "../../store/me";

export const MePage: PageComponent = () => {
  const { me, update } = useMeStore();
  const [name, setName] = useState(me.display_name);
  const [remember, setRemember] = useState(
    localStorage.getItem("remember me") === "true"
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <Box>
        <Center>
          <Paper
            padding={"xl"}
            shadow={"sm"}
            radius="md"
            style={{ width: 350 }}
          >
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

                  update(name, remember);
                  toast.success("updated");
                }}
              >
                update
              </Button>
            </Group>
          </Paper>
        </Center>
      </Box>
    </Layout>
  );
};

MePage.authenticate = "yes";
