import { Box, Group } from "@mantine/core";
import { GoPrimitiveDot } from "react-icons/go";
import { Icon } from "../../components/Icon";

export const RoomLegend = () => {
  return (
    <Group align="center">
      <Box style={{ display: "flex", alignItems: "center" }}>
        you and room owner
        <Icon>
          <GoPrimitiveDot />
        </Icon>
      </Box>

      <Box style={{ display: "flex", alignItems: "center" }}>
        you
        <Icon>
          <GoPrimitiveDot />
        </Icon>
      </Box>
    </Group>
  );
};
