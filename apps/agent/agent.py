import os
import json
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, mcp
from livekit.plugins import (
    openai,
    noise_cancellation,
)
from livekit.plugins.openai import realtime
from openai.types.beta.realtime.session import TurnDetection
import logging, sys
from prompt import SYS_PROMPT

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)

load_dotenv()


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYS_PROMPT)


async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()

    # Wait for the first participant to join
    participant = await ctx.wait_for_participant()

    metadata = json.loads(participant.metadata)
    access_token = metadata.get("accessToken")
    dev = metadata.get("dev")

    # MAKE SURE TO ADD BACK THIS CHECK BEFORE GIT PUSH
    if dev:
        return

    if not access_token:
        raise Exception("No access token found")

    session = AgentSession(
        llm=realtime.RealtimeModel(
            turn_detection=TurnDetection(
                type="semantic_vad",
                eagerness="auto",
                create_response=True,
                interrupt_response=True,
            ),
            voice="coral",
        ),
        mcp_servers=[
            mcp.MCPServerHTTP(
                url="https://mcp.notion.com/sse",
                timeout=30,
                client_session_timeout_seconds=30,
                headers={"Authorization": f"Bearer {access_token}"},
            ),
        ],
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await session.generate_reply(
        instructions="Ayo?"
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
