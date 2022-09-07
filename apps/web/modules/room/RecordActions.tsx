import { ActionIcon, ActionIconProps, Text } from "@mantine/core";
import { memo } from "react";
import {
  BsPauseFill,
  BsPlayFill,
  BsRecordFill,
  BsStopFill
} from "react-icons/bs";
import { useStopwatch } from "react-timer-hook";

const styles: ActionIconProps = {
  color: "red",
  variant: "outline",
  radius: "xl",
  sx: (theme) => ({
    "&:hover": {
      backgroundColor: theme.colors.dark[8]
    }
  })
};

interface Props {
  state: RecordState;
  actions: {
    start: () => Promise<void>;
    stop: () => void;
    pause: () => void;
    play: () => void;
  };
}

export type RecordState = "recording" | "paused" | "idle";

export const RecordActions = memo(({ state, actions }: Props) => {
  const { seconds, minutes, hours, start, pause, reset } = useStopwatch({
    autoStart: false
  });

  const idle = state === "idle";
  const recording = state === "recording";
  const paused = state === "paused";

  const elapsed = (
    <Text color="white" italic size="sm">
      <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
    </Text>
  );

  const Stop = (
    <ActionIcon
      {...styles}
      onClick={() => {
        actions.stop();

        reset(undefined, false);
      }}
    >
      <BsStopFill />
    </ActionIcon>
  );

  if (idle)
    return (
      <ActionIcon
        {...styles}
        onClick={async () => {
          await actions.start();

          start();
        }}
      >
        <BsRecordFill />
      </ActionIcon>
    );

  if (recording)
    return (
      <>
        {elapsed}
        {Stop}

        <ActionIcon
          {...styles}
          onClick={() => {
            actions.pause();

            pause();
          }}
        >
          <BsPauseFill />
        </ActionIcon>
      </>
    );

  if (paused)
    return (
      <>
        {elapsed}
        <ActionIcon
          {...styles}
          onClick={() => {
            actions.play();

            start();
          }}
        >
          <BsPlayFill />
        </ActionIcon>
        {Stop}
      </>
    );

  return null;
});
