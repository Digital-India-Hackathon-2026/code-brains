import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent

PAYLOAD_PATH = (
    PROJECT_ROOT
    / "data"
    / "synthetic"
    / "investigation_payloads.json"
)


def load_investigations():
    """
    Load all generated investigation cases.
    """

    if not PAYLOAD_PATH.exists():
        raise FileNotFoundError(
            f"Investigation payload not found:\n{PAYLOAD_PATH}"
        )

    with open(
        PAYLOAD_PATH,
        "r",
        encoding="utf-8",
    ) as file:
        return json.load(file)


def get_all_investigations():
    """
    Return all suspicious-account investigations.
    """

    data = load_investigations()

    return data["investigations"]


def get_investigation(investigation_id):
    """
    Return one investigation by investigation ID.
    """

    investigations = get_all_investigations()

    for case in investigations:

        if (
            case["investigation_id"]
            == investigation_id
        ):
            return case

    return None


def get_investigations_by_risk(risk_level):
    """
    Return investigations matching a risk level.

    Valid values:
        LOW
        MEDIUM
        HIGH
        CRITICAL
    """

    risk_level = risk_level.upper()

    valid_levels = {
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    }

    if risk_level not in valid_levels:
        raise ValueError(
            f"Invalid risk level: {risk_level}"
        )

    investigations = get_all_investigations()

    return [
        case
        for case in investigations
        if case["risk_assessment"][
            "mule_risk_level"
        ] == risk_level
    ]


def get_investigation_summary():
    """
    Return overall investigation statistics.
    """

    data = load_investigations()

    return {
        "system": data["system"],
        "summary": data["summary"],
    }


def get_ai_agent_payload(investigation_id):
    """
    Return a compact payload specifically for the
    AI Investigation Agent.
    """

    case = get_investigation(
        investigation_id
    )

    if case is None:
        return {
            "success": False,
            "error": (
                f"Investigation not found: "
                f"{investigation_id}"
            ),
        }

    return {
        "success": True,

        "investigation_id": case[
            "investigation_id"
        ],

        "account_id": case[
            "account_id"
        ],

        "risk_assessment": case[
            "risk_assessment"
        ],

        "behavioral_profile": case[
            "behavioral_profile"
        ],

        "behavioral_evidence": case[
            "behavioral_evidence"
        ],

        "pass_through_events": case[
            "pass_through_events"
        ],

        "network_context": case[
            "network_context"
        ],

        "transaction_risk_summary": case[
            "transaction_risk_summary"
        ],

        "related_transactions": case[
            "related_transactions"
        ],

        "agent_task": case[
            "ai_agent_context"
        ],
    }


if __name__ == "__main__":

    print("=" * 70)
    print("INVESTIGATION API TEST")
    print("=" * 70)

    summary = get_investigation_summary()

    print("\nSummary:")
    print(
        json.dumps(
            summary,
            indent=4,
        )
    )

    investigations = (
        get_all_investigations()
    )

    print(
        f"\nAvailable investigations: "
        f"{len(investigations)}"
    )

    if investigations:

        first_id = investigations[0][
            "investigation_id"
        ]

        print(
            f"\nTesting AI agent payload "
            f"for: {first_id}"
        )

        payload = get_ai_agent_payload(
            first_id
        )

        print(
            json.dumps(
                payload,
                indent=4,
            )
        )