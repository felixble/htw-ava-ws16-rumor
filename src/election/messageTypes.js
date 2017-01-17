

export const MessageTypes = {
    /*
    * Control messages to control a network
    * node such as STOP or STOP_ALL.
    */
    CONTROL: 'control',

    GET_STATUS: 'get-status',

    /*
    * Initializes the
    * candidate-process
    */
    INIT: 'init',

    CAMPAIGN: 'campaign',
    CHOOSE_ME: 'choose-me',
    NOT_YOU: 'not-you',
    KEEP_IT_UP: 'keep-it-up'
};