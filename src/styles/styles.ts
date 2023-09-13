import { Dimensions, StyleSheet } from 'react-native'
const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#440031',
  },
  centerContainer: {
    top: '25%',
    alignItems: 'center',
    paddingBottom: '15%',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#440031',
  },
  text: {
    color: '#FFFFFF',
  },
  input: {
    width: '100%',
    height: 30,
    padding: 7,
    backgroundColor: 'rgba(0,169,157,0.15)',
    borderWidth: 1,
    borderColor: '#5B5B5B',
    borderRadius: 3,
    color: '#FFFFFF',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: screenHeight * 0.052,
    width: screenWidth * 0.91,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#A82D5B',
    borderTopRadius: 0,
  },
  borderlessInput: {
    fontSize: 36,
    color: '#FFFFFF',
  },
  main: {
    paddingHorizontal: 12,
    display: 'flex',
    alignItems: 'center',
  },
  qrButton: {
    height: 100,
    width: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectAccountRadioContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: '3.69%',
    justifyContent: 'center',
  },
  orangeButton: {
    backgroundColor: '#F96943',
    borderRadius: 5,
    height: screenHeight * 0.043,
    width: screenWidth * 0.4,
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  orangeButtonText: {
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  redButton: {
    backgroundColor: '#AB2400',
    borderRadius: 5,
    height: screenHeight * 0.043,
    width: screenWidth * 0.4,
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  redButtonText: {
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
    color: '#FFFFFF',
  },
  rectangleButtonPink: {
    height: screenHeight * 0.1,
    width: screenWidth,
    backgroundColor: 'rgba(249,105,67,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1%',
  },
  rectangleButtonPurple: {
    height: screenHeight * 0.1,
    width: screenWidth,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '1%',
    backgroundColor: 'rgba(0,169,157,0.15)',
  },
  rectangleButtonText: {
    paddingLeft: '9.33%',
    paddingRight: '29.33%',
    color: '#FFFFFF',
    fontSize: 12,
  },
  rectangleButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    height: 40,
    backgroundColor: 'rgba(0, 169, 157, 0.15)',
    display: 'flex',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingTop: 20,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.2,
  },
  purpleButtonHighlight: {
    backgroundColor: 'rgba(0,169,157,0.25)',
  },
  keyContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(151,151,151,0.5)',
  },
})

export default styles
