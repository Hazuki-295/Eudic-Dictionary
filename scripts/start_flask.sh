#!/bin/zsh

# Setup environment and paths
SCRIPT_PATH=$(dirname "$0")
CONDA_ENV=NLP
FLASK_SERVER_SCRIPT="$SCRIPT_PATH/nlp.py"
LOG_FILE="$SCRIPT_PATH/log/flask_eudicnotes.log"

# Log messages with timestamp and type
log_message() {
    local message="$1"
    local msg_type="${2:-EudicNotes}"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - [$msg_type] $message" >> $LOG_FILE
}

# Start Flask server and log its output
start_flask() {
    source "$HOME/.zshrc" && conda activate "$CONDA_ENV" && python "$FLASK_SERVER_SCRIPT" 2>&1 | tee -a "$LOG_FILE" &
    FLASK_PID=$!
    log_message "Flask server started with PID $FLASK_PID." "FLASK"
}

# Open EudicNotes app
open_eudicnotes() {
    open -a /Applications/EudicNotes/EudicNotes.app && log_message "EudicNotes app opened."
}

# Check if EudicNotes is running
is_eudicnotes_running() {
    pgrep -f EudicNotes > /dev/null
}

# Terminate Flask server
terminate_flask() {
    if [[ -n "$FLASK_PID" ]]; then
        kill "$FLASK_PID" && log_message "Flask server with PID $FLASK_PID terminated."
    fi
}

# Main execution flow
main() {
    setup_environment
    log_message "-------------------"
    log_message "Script execution started."
    start_flask
    open_eudicnotes

    while true; do
        if ! is_eudicnotes_running; then
            log_message "EudicNotes is not running. Terminating Flask server..."
            terminate_flask
            break
        fi
        sleep 5
    done

    log_message "Script execution completed."
}

main "$@"