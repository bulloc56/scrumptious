from app import app, socketio
import os
if __name__ == '__main__':
    port = int(os.environ.get(“PORT”, 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
#must add host='0.0.0.0', port=5000, inside to run on AWS
