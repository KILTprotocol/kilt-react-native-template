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
    // marginBottom: 5,
    // fontSize: 14,
  },
  textInput: {
    padding: 5,
    paddingStart: 15,
    backgroundColor: '#3b3b3b',
    width: screenWidth * 0.8,
    borderRadius: 25,
    marginBottom: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: screenHeight * 0.052,
    backgroundColor: 'rgba(249,105,67,0.2)',
    width: screenWidth * 0.91,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#A82D5B',
    borderTopRadius: 0,
  },
  selectAccountRadioContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: '3.69%',
    flex: 1,
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
})

export default styles
