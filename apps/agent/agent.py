import os
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

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)

load_dotenv()


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="You are a productivity assistant with access to the user's Notion worrkspace."
        )


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        llm=realtime.RealtimeModel(
            turn_detection=TurnDetection(
                type="semantic_vad",
                eagerness="auto",
                create_response=True,
                interrupt_response=True,
            )
        ),
        mcp_servers=[
            mcp.MCPServerHTTP(
                url="https://mcp.notion.com/sse",
                timeout=20,
                client_session_timeout_seconds=20,
                headers={
                    "Authorization": f"Bearer 4f55f95a-f65b-4723-8eb3-dc3cfddf8225:DW19mZbDcPezsrtI:zSEfAi9coMHYVh7I0oMof64HO1Ztv3lH"
                },
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

    await ctx.connect()

    await session.generate_reply(
        instructions="Search the user's Notion and give an overview of what's in it."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
